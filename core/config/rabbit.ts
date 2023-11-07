import amqplib, { Channel, Connection } from "amqplib";
import { Logger, ILogObj } from "tslog";
import { ERROR } from "../error";
import { burn, mint, getVersion } from "..";
import { MintParams } from "../type";
import { assertEqual, getDateNow, getOrDefault, parseError, waitForTransaction, waitUntil } from "../utils";
import { MAX_ATTEMPTS, HALF_MINUTE } from ".";

const log: Logger<ILogObj> = new Logger();

let rabbitMQ: Connection;
try {
  rabbitMQ = await amqplib.connect("amqp://localhost");
  log.debug("Connected to RabbitMQ", rabbitMQ!.connection!.serverProperties!.cluster_name);
} catch (error: any) {
  log.error("Error connecting to RabbitMQ", error);
  throw error;
}

export const CardanoService: string = getOrDefault(process?.env?.CHANNEL_NAME, "CardanoService");
export const ResolverService: string = "ResolverService";

const queue: {
  [key: string]: string,
} = {
  [CardanoService]: CardanoService,
  [ResolverService]: ResolverService,
};

const cardanoChannel: Channel = await rabbitMQ!.createChannel();
await cardanoChannel.assertQueue(queue[CardanoService], { durable: true });

const resolverChannel: Channel = await rabbitMQ!.createChannel();
await resolverChannel.assertQueue(queue[ResolverService], { durable: true });

const channel: {
  [key: string]: Channel,
} = {
  [CardanoService]: cardanoChannel,
  [ResolverService]: resolverChannel,
};

export function getSender({ service }: { service: string }): { sender: Channel, queue: string } {
  return {
    sender: channel[service],
    queue: queue[service],
  };
}

channel?.[CardanoService].consume(queue?.[CardanoService], async (msg) => {
  if (msg !== null) {
    const { sender } = getSender({ service: ResolverService });
    const request: any = JSON.parse(msg.content.toString());

    const data: any = getOrDefault(request?.data, {});
    const options: any = getOrDefault(request?.options, {});

    options.id = request?.id;
    options.type = request?.type;
    options.publish = true;
    options.skipWait = false;

    options.channel = channel[CardanoService];
    options.msg = msg;

    const retryCount: number = getOrDefault(request?.retryCount, 0);
    const retryAfter: number = getOrDefault(request?.retryAfter, 0);

    try {
      if (retryAfter > getDateNow()) {
        await waitUntil(retryAfter);
      }

      switch (request?.type) {
        case "mint-token": {
          await mint({
            assets: [
              {
                assetName: data!.hash!,
                metadata: {
                  name: data!.hash!,
                  type: data!.type!,
                  version: 0,
                },
              },
            ],
            options,
          });
        }
          break;
        case "update-token": {
          if (data?.txHash) {
            await waitForTransaction(data?.txHash);
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
          break;
        case "mint-credential": {
          const assets: MintParams[] = [];
          for (const credential of data?.credentials) {
            assets.push({
              assetName: credential!,
              forgingScript: data!.config!.forgingScript!,
              metadata: {
                name: credential!,
                type: data!.type!,
                version: 0,
                belongsTo: data!.config!.assetName!,
              },
            });
          }
          await mint({
            assets,
            options,
          });
        }
          break;
        case "burn-token": {
          if (data?.txHash) {
            await waitForTransaction(data?.txHash);
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
          break;
        default: {
          channel[CardanoService].ack(msg);
          if (retryCount < MAX_ATTEMPTS) {
            sender.sendToQueue(queue[ResolverService], Buffer.from(
              JSON.stringify(parseError({
                ...ERROR.NOT_YET_IMPLEMENTED,
                data: {
                  id: options?.id,
                  type: options?.type,
                  data: { ...request?.data },
                  retryCount: retryCount + 1,
                  retryAfter: getDateNow() + HALF_MINUTE,
                },
              })),
            ));
          }
        }
          break;
      }
    } catch (error: any) {
      log.error(error);
      channel[CardanoService].ack(msg);
      if (retryCount < MAX_ATTEMPTS) {
        sender.sendToQueue(queue[ResolverService], Buffer.from(
          JSON.stringify(parseError({
            data: {
              data: { ...request?.data },
              id: options?.id,
              type: options?.type,
              retryCount: retryCount + 1,
              retryAfter: getDateNow() + HALF_MINUTE,
            },
            error_message: "Meomeow 🐰",
          })),
        ));
      }
    }
  }
});