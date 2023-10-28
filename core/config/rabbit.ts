import amqplib, { Channel, Connection } from "amqplib";
import { Logger, ILogObj } from "tslog";

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

const queue: {
  [key: string]: string,
} = {
  CardanoService: CardanoService,
  TaskQueue: TaskQueue,
};

const cardanoChannel: Channel = await rabbitMQ!.createChannel();
await cardanoChannel.assertQueue(queue[CardanoService], { durable: true });

const taskChannel: Channel = await rabbitMQ!.createChannel();
await taskChannel.assertQueue(queue[TaskQueue], { durable: true });

const channel: {
  [key: string]: Channel,
} = {
  CardanoService: cardanoChannel,
  TaskQueue: taskChannel,
};

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
    await Bun.sleep(10_000);
    const { sender, queue } = getSender({ service: TaskQueue });
    sender.sendToQueue(queue, Buffer.from("Response from CardanoService"));
    channel[CardanoService].ack(msg);
  }
});

export function getSender({ service }: { service: string }): { sender: Channel, queue: string } {
  return {
    sender: channel[service],
    queue: queue[service],
  };
}