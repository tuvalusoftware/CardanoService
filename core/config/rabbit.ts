import amqplib, { Channel, Connection } from "amqplib";
import { Logger, ILogObj } from "tslog";
import { parseError, parseResult, ERROR } from "../error";
import { burn, mint, getVersion } from "..";
import { MintParams } from "../type";

const log: Logger<ILogObj> = new Logger();

let rabbitMQ: Connection;
try {
  rabbitMQ = await amqplib.connect("amqp://localhost");
  log.debug("Connected to RabbitMQ", rabbitMQ!.connection!.serverProperties!.cluster_name);
} catch (error: any) {
  log.error("Error connecting to RabbitMQ", error);
  throw error;
}

export const CardanoService: string = "CardanoService";
export const ResolverService: string = "ResolverService";

const queue: {
  [key: string]: string,
} = {
  CardanoService: CardanoService,
  ResolverService: ResolverService,
};

const cardanoChannel: Channel = await rabbitMQ!.createChannel();
await cardanoChannel.assertQueue(queue[CardanoService], { durable: true });

const resolverChannel: Channel = await rabbitMQ!.createChannel();
await resolverChannel.assertQueue(queue[ResolverService], { durable: true });

const channel: {
  [key: string]: Channel,
} = {
  CardanoService: cardanoChannel,
  ResolverService: resolverChannel,
};

export function getSender({ service }: { service: string }): { sender: Channel, queue: string } {
  return {
    sender: channel[service],
    queue: queue[service],
  };
}

channel[CardanoService].consume(queue[CardanoService], async (msg) => {
  if (msg !== null) {
    const { sender } = getSender({ service: ResolverService });
    const request: any = JSON.parse(msg.content.toString());

    const data: any = request?.data || {};
    const options: any = request?.options || {};

    options.id = request?.id;
    options.type = request?.type;
    options.publish = true;
    options.skipWait = false;

    options.channel = channel[CardanoService];
    options.msg = msg;

    try {
      switch (request?.type) {
        case "mint-token": {
          log.debug("Minting token");
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
          log.debug("Updating token");
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
          log.debug("Minting credential");
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
          log.debug("Burning token");
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
          sender.sendToQueue(queue[ResolverService], Buffer.from(
            JSON.stringify(parseError({
              ...ERROR.NOT_YET_IMPLEMENTED,
              data: { type: request?.type, id: request?.id }
            })),
          ));
          channel[CardanoService].ack(msg);
        }
          break;
      }
    } catch (error: any) {
      log.error(JSON.stringify(error));
      sender.sendToQueue(queue[ResolverService], Buffer.from(
        JSON.stringify(parseError({
          data: { type: request?.type, id: request?.id },
          error_message: "Meomeow 🐰",
        })),
      ));
      channel[CardanoService].ack(msg);
    }
  }
});