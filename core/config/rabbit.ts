import amqplib, { Channel, Connection } from "amqplib";
import { Logger, ILogObj } from "tslog";
import { parseError, parseResult } from "../error";
import { burn, mint } from "..";

const log: Logger<ILogObj> = new Logger();

let rabbitMQ: Connection;
try {
  rabbitMQ = await amqplib.connect("amqp://localhost");
  log.debug("Connected to RabbitMQ", rabbitMQ!.connection!.serverProperties!.cluster_name);
} catch (error: any) {
  log.error("Error connecting to RabbitMQ", error);
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
    log.debug("[CardanoService] 🔈", request);
    const data: any = request?.data || {};
    const options: any = request?.options || {};
    options.id = request?.id;
    options.type = request?.type;
    options.publish = true;
    try {
      switch (request?.type) {
        case "mint-token":
          channel[CardanoService].ack(msg);
          await mint({
            assets: [
              {
                assetName: data?.hash,
                metadata: {
                  attach: data?.hash,
                  type: data?.type,
                  did: data?.did,
                  version: 0,
                },
              },
            ],
            options,
          });
          break;
        case "burn-token":
          channel[CardanoService].ack(msg);
          await burn({
            assets: [
              {
                unit: data?.unit,
                assetName: data?.assetName,
                forgingScript: data?.forgingScript,
                policyId: data?.policyId,
                removeCollection: data?.removeCollection,
              },
            ],
            options,
          });
          break;
        default:
          sender.sendToQueue(queue[ResolverService], Buffer.from(
            JSON.stringify(parseError({
              error_code: 501,
              error_message: "Not Implemented",
              data: { type: request?.type, id: request?.id }
            })),
          ));
          break;
      }
    } catch (error: any) {
      log.error(error);
      sender.sendToQueue(queue[ResolverService], Buffer.from(
        JSON.stringify(parseError({
          data: { type: request?.type, id: request?.id },
        })),
      ));
    }
  }
});