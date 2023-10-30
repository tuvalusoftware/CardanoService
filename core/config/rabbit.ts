import amqplib, { Channel, Connection } from "amqplib";
import { Logger, ILogObj } from "tslog";
import { parseError, parseResult } from "../error";
import { mint } from "..";

const log: Logger<ILogObj> = new Logger();

let rabbitMQ: Connection;
try {
  rabbitMQ = await amqplib.connect("amqp://localhost");
  log.debug("Connected to RabbitMQ", rabbitMQ!.connection!.serverProperties!.cluster_name);
} catch (error) {
  log.error("Error connecting to RabbitMQ", error);
}

export const CardanoService: string = "CardanoService";
export const TaskQueue: string = "TaskQueue";
export const ResolverService: string = "ResolverService";

const queue: {
  [key: string]: string,
} = {
  CardanoService: CardanoService,
  TaskQueue: TaskQueue,
  ResolverService: ResolverService,
};

const cardanoChannel: Channel = await rabbitMQ!.createChannel();
await cardanoChannel.assertQueue(queue[CardanoService], { durable: true });

const taskChannel: Channel = await rabbitMQ!.createChannel();
await taskChannel.assertQueue(queue[TaskQueue], { durable: true });

const resolverChannel: Channel = await rabbitMQ!.createChannel();
await resolverChannel.assertQueue(queue[ResolverService], { durable: true });

const channel: {
  [key: string]: Channel,
} = {
  CardanoService: cardanoChannel,
  TaskQueue: taskChannel,
  ResolverService: resolverChannel,
};

export function getSender({ service }: { service: string }): { sender: Channel, queue: string } {
  return {
    sender: channel[service],
    queue: queue[service],
  };
}

channel[TaskQueue].consume(queue[TaskQueue], async (msg) => {
  if (msg !== null) {
    log.debug("[TaskQueue] 🔈", msg.content.toString());
    await Bun.sleep(10_000);
    channel[TaskQueue].ack(msg);
  }
});

channel[CardanoService].consume(queue[CardanoService], async (msg) => {
  if (msg !== null) {
    log.debug("[CardanoService] 🔈", msg.content.toString());
    const { sender } = getSender({ service: ResolverService });
    const request: any = JSON.parse(msg.content.toString());
    switch (request?.type) {
      // {
      //   "type": "mint-token",
      //   "data": {
      //     "hash": "e4c7d948c1c57e9239128997eb8e003cce0aba7c56957e90c2ee1c768308a0ef"
      //   },
      //   "_id": "_id_43Xwe1"
      // }
      case "mint-token":
        const response: any = await mint({
          assets: [
            {
              assetName: request?.data?.hash,
            }
          ],
        });
        sender.sendToQueue(queue[ResolverService], Buffer.from(
          JSON.stringify(parseResult(response))
        ));
        break;
      default:
        sender.sendToQueue(queue[ResolverService], Buffer.from(
          JSON.stringify(parseError({
            statusCode: 501,
            message: "Not Implemented",
          })),
        ));
        break;
    }
    channel[CardanoService].ack(msg);
  }
});