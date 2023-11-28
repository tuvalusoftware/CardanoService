import amqplib, { Channel, Connection } from "amqplib";
import { Logger, ILogObj } from "tslog";
import { burn, mint, getVersion } from "..";
import { MintParams } from "../type";
import { getDateNow, getOrDefault, waitForTransaction } from "../utils";
import { RABBITMQ_DEFAULT_PASS, RABBITMQ_DEFAULT_USER, RABBITMQ_DEFAULT_VHOST, RABBITMQ_DEFAULT_PORT, ONE_HOUR } from ".";

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
  log.debug("Connected to RabbitMQ", rabbitMQ!.connection!.serverProperties!.cluster_name);

  rabbitMQ.setMaxListeners(0);
} catch (error: any) {
  log.error("Error connecting to RabbitMQ", error);
  throw error;
}

rabbitMQ?.on("error", async (error: any) => {
  log.error("Ocurred an error in RabbitMQ", error);
  throw error;
});

export const CardanoService: string = getOrDefault(process?.env?.CHANNEL_NAME, "CardanoService");
export const ResolverService: string = "ResolverService";

const queue: {
  [key: string]: string,
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
  console.log("Prefetching 1 message");
  await cardanoChannel.prefetch(1);
  return cardanoChannel;
};

export const getResolverChannel = async (): Promise<Channel> => {
  let resolverChannel: Channel = await rabbitMQ!.createChannel();
  await resolverChannel.assertQueue(queue[ResolverService], { durable: true });
  resolverChannel = resolverChannel.setMaxListeners(0);
  return resolverChannel;
};

const channel: {
  [key: string]: Channel,
} = {
  [CardanoService]: await getCardanoChannel(),
  [ResolverService]: await getResolverChannel(),
};

export function getSender({ service }: { service: string }): { sender: Channel, queue: string } {
  return {
    sender: channel[service],
    queue: queue[service],
  };
}

channel?.[CardanoService].consume(queue?.[CardanoService], async (msg) => {
  if (msg !== null) {
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
      switch (request?.type) {
        case "mint-token": {
          await mint({
            assets: [
              {
                assetName: data!.hash!,
                metadata: {
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
                timestamp: getDateNow(),
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
        }
          break;
      }
    } catch (error: any) {
      log.error(error);
      channel[CardanoService].nack(msg);
    }
  }
});