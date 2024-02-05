import amqplib, { Channel, Connection } from "amqplib";
import { Logger, ILogObj } from "tslog";
import { burn, mint, getVersion, getCacheValue } from "..";
import { MintParams } from "../type";
import {
  delay,
  getDateNow,
  getOrDefault,
  parseError,
  waitForTransaction,
} from "../utils";
import {
  RABBITMQ_DEFAULT_PASS,
  RABBITMQ_DEFAULT_USER,
  RABBITMQ_DEFAULT_VHOST,
  RABBITMQ_DEFAULT_PORT,
  ONE_HOUR,
  MAX_ATTEMPTS,
  TWO_SECONDS,
  FIVE_SECONDS,
  TEN_SECONDS,
} from ".";
import { deleteCacheValue, increaseCacheValue, setCacheValue } from "./redis";

const log: Logger<ILogObj> = new Logger();

let rabbitMQ: Connection;
try {
  rabbitMQ = await amqplib.connect({
    protocol: "amqp",
    hostname: RABBITMQ_DEFAULT_VHOST,
    port: RABBITMQ_DEFAULT_PORT,
    username: RABBITMQ_DEFAULT_USER,
    password: RABBITMQ_DEFAULT_PASS,
    heartbeat: ONE_HOUR,
  });
  log.debug(
    "Connected to RabbitMQ",
    rabbitMQ!.connection!.serverProperties!.cluster_name
  );

  rabbitMQ.setMaxListeners(0);
} catch (error: any) {
  log.error("Error connecting to RabbitMQ", error);
  process.exit(1);
}

rabbitMQ?.on("error", (error: any) => {
  log.error("Ocurred an error in RabbitMQ", error);
  throw error;
});

export const CardanoService: string = getOrDefault(
  process?.env?.CHANNEL_NAME,
  "CardanoService"
);
export const ResolverService: string = "ResolverService";

export const queue: {
  [key: string]: string;
} = {
  [CardanoService]: CardanoService,
  [ResolverService]: ResolverService,
};

export const getCardanoChannel = async (): Promise<Channel> => {
  let cardanoChannel: Channel = await rabbitMQ!.createChannel();

  await cardanoChannel.assertQueue(queue[CardanoService], {
    durable: true,
  });
  cardanoChannel = cardanoChannel.setMaxListeners(0);
  log.silly("Prefetching [1] message");
  await cardanoChannel.prefetch(1);

  cardanoChannel.on("error", (error: any) => {
    log.error("Ocurred an error in Cardano channel", error);
    process.exit(1);
  });

  cardanoChannel.on("close", () => {
    log.warn("Cardano channel closed");
    process.exit(1);
  });

  return cardanoChannel;
};

export const getResolverChannel = async (): Promise<Channel> => {
  let resolverChannel: Channel = await rabbitMQ!.createChannel();

  await resolverChannel.assertQueue(queue[ResolverService], { durable: true });
  resolverChannel = resolverChannel.setMaxListeners(0);

  resolverChannel.on("error", (error: any) => {
    log.error("Ocurred an error in Resolver channel", error);
    process.exit(1);
  });

  resolverChannel.on("close", () => {
    log.warn("Resolver channel closed");
    process.exit(1);
  });

  return resolverChannel;
};

const channel: {
  [key: string]: Channel;
} = {
  [CardanoService]: await getCardanoChannel(),
  [ResolverService]: await getResolverChannel(),
};

export function getSender({ service }: { service: string }): {
  sender: Channel;
  queue: string;
  type?: string;
} {
  return {
    sender: channel[service],
    queue: queue[service],
    type: "get",
  };
}

export async function createSender({
  queue,
}: {
  queue: string;
}): Promise<{ sender: Channel; queue: string; type?: string }> {
  try {
    let channel: Channel = await rabbitMQ!.createChannel();
    await channel.assertQueue(queue, { durable: true });
    return {
      sender: channel,
      queue,
      type: "create",
    };
  } catch (error: any) {
    log.error("Error creating sender", error);
    return getSender({ service: ResolverService });
  }
}

export async function getOrCreateSender({
  queue,
}: {
  queue: string;
}): Promise<{ sender: Channel; queue?: string; type?: string }> {
  if (channel[queue]) {
    return getSender({ service: queue });
  }
  return await createSender({ queue });
}

channel?.[CardanoService].consume(queue?.[CardanoService], async (msg) => {
  if (msg !== null) {
    const request: any = JSON.parse(msg.content.toString());

    const data: any = getOrDefault(request?.data, {});
    const options: any = getOrDefault(request?.options, {});

    log.debug("[+] Received message", JSON.stringify(data, null, 2));

    options.id = request?.id;
    options.type = request?.type;
    options.publish = true;
    options.skipWait = true;

    options.replyTo = msg?.properties?.replyTo;
    options.correlationId = msg?.properties?.correlationId;
    log.debug("[v] Reply to", options?.replyTo);

    options.channel = channel[CardanoService];
    options.msg = msg;

    let retryCount: number = await getCacheValue({
      key: `retryCount:${request?.id?.toString()}`,
    });

    if (!retryCount) {
      retryCount = 0;
      await setCacheValue({
        key: `retryCount:${request?.id?.toString()}`,
        value: 0,
        expiredTime: -1,
      });
    }

    log.debug("[R] Retry count", retryCount);

    if (request?.id && retryCount > MAX_ATTEMPTS) {
      log.error("🐥 Retry count exceeded", options?.id);
      channel[CardanoService].ack(msg);
      const { sender, queue: q } = await getOrCreateSender({
        queue: getOrDefault(options?.replyTo, ResolverService),
      });
      sender?.sendToQueue(
        q!,
        Buffer.from(
          JSON.stringify(
            parseError({
              data: {
                data: { ...request?.data },
                id: options?.id,
                type: options?.type,
              },
              error_message: "Meomeow 🐰: Retry count exceeded",
            })
          )
        ),
        {
          correlationId: options?.correlationId,
        }
      );
      await setCacheValue({
        key: `retryCount:${request?.id?.toString()}`,
        value: 0,
        expiredTime: -1,
      });
      return;
    }

    try {
      switch (request?.type) {
        case "mint-token":
          {
            if (!data?.hash) {
              channel[CardanoService].ack(msg);
            } else {
              await mint({
                assets: [
                  {
                    assetName: data!.hash!,
                    metadata: data?.metadata ?? {
                      name: data!.hash!,
                      type: data!.type!,
                      timestamp: getDateNow(),
                      version: 0,
                    },
                  },
                ],
                options,
              });
            }
          }
          break;
        case "update-token":
          {
            if (!data?.newHash || !data?.type || !data?.config?.assetName) {
              channel[CardanoService].ack(msg);
            } else {
              if (data?.txHash) {
                await waitForTransaction(data?.txHash);
                await delay(FIVE_SECONDS);
              }
              const assets: MintParams[] = [];
              const version: number = await getVersion({
                unit: data!.config!.unit!,
              });
              const asset: MintParams = {
                assetName: data!.newHash!,
                metadata: {
                  name: data?.newHash!,
                  type: data!.type!,
                  version,
                  timestamp: getDateNow(),
                  belongsTo: data!.config!.assetName!,
                },
              };
              if (data?.reuse) {
                asset.forgingScript = data!.config!.forgingScript!;
              }
              if (data?.burn) {
                log.warn("Burning old token, not yet implemented");
              }
              assets.push(asset);
              await mint({
                assets,
                options,
              });
            }
          }
          break;
        case "mint-credential":
          {
            if (!data?.config?.assetName || !data?.config?.forgingScript) {
              channel[CardanoService].ack(msg);
            } else {
              const assets: MintParams[] = [];
              for (const credential of data?.credentials) {
                if (!credential) {
                  continue;
                }
                assets.push({
                  assetName: credential!,
                  forgingScript: data!.config!.forgingScript!,
                  metadata: {
                    name: credential!,
                    type: data!.type!,
                    version: 0,
                    timestamp: getDateNow(),
                    belongsTo: data!.config!.assetName!,
                  },
                });
              }
              if (assets.length > 0) {
                await mint({
                  assets,
                  options,
                });
              } else {
                channel[CardanoService].ack(msg);
              }
            }
          }
          break;
        case "burn-token":
          {
            if (!data?.assetName || !data?.forgingScript || !data?.unit) {
              channel[CardanoService].ack(msg);
            } else {
              if (data?.txHash) {
                await waitForTransaction(data?.txHash);
                await delay(FIVE_SECONDS);
              }
              await burn({
                assets: [
                  {
                    txHash: data?.txHash,
                    unit: data!.unit,
                    assetName: data?.assetName,
                    forgingScript: data!.forgingScript,
                    policyId: data?.policyId,
                    removeCollection: data?.removeCollection,
                  },
                ],
                options,
              });
            }
          }
          break;
        default:
          {
            log.error("[!] Invalid type", request?.type, request?.id);
            channel[CardanoService].ack(msg);
            const { sender, queue: q } = await getOrCreateSender({
              queue: getOrDefault(options?.replyTo, ResolverService),
            });
            sender?.sendToQueue(
              q!,
              Buffer.from(
                JSON.stringify(
                  parseError({
                    data: {
                      data: { ...request?.data },
                      id: options?.id,
                      type: options?.type,
                    },
                    error_message: "Meomeow 🐰: Invalid type",
                  })
                )
              ),
              {
                correlationId: options?.correlationId,
              }
            );
          }
          break;
      }
      log.info("✅ Message processed", request?.id?.toString());
      await deleteCacheValue({
        key: `retryCount:${request?.id?.toString()}`,
      });
    } catch (error: any) {
      log.error("🚨 Error processing message", request?.id);
      log.error(error);
      await increaseCacheValue({
        key: `retryCount:${request?.id?.toString()}`,
        expiredTime: -1,
      });
      await delay(TEN_SECONDS);
      channel[CardanoService].nack(msg);
    }
  }
});

process.on("SIGINT", async () => {
  await rabbitMQ?.close();
});

process.on("SIGTERM", async () => {
  await rabbitMQ?.close();
});

export default rabbitMQ;
