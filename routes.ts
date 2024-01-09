import express, { Router } from "express";
import fs from "fs";
import { assertEqual, delay, parseError, parseResult, wait } from "./core/utils";
import { Logger, ILogObj } from "tslog";
import { burn, fetch } from "./core";
import { FetchOptions } from "./core/type";
import { randomUUID } from "node:crypto";
import rabbitMQ, { CardanoService, queue } from "./core/config/rabbit";
import { Channel } from "amqplib";
import { ERROR } from "./core/error";
import { ONE_HOUR, TEN_MINUTES } from "./core/config";

const log: Logger<ILogObj> = new Logger();

const router: Router = express.Router();

/* -----------------[ V3 ]----------------- */

router.post("/api/v3/mint", async (req, res) => {
  console.profile("mint");
  const { assets } = req.body;
  assertEqual(0 < assets.length, true, ERROR.NO_ASSETS);
  assertEqual(assets.length <= 1, true, ERROR.TOO_MANY_ASSETS);
  try {
    const promise = new Promise(async (resolve, reject) => {
      const replyTo: string = randomUUID();
      const correlationId: string = randomUUID();
      let channel: Channel = await rabbitMQ!.createChannel();
      await channel.assertQueue(replyTo, {
        durable: true,
      });
      channel.prefetch(1);
      channel.consume(replyTo, async (msg) => {
        if (msg?.properties.correlationId == correlationId) {
          const response = JSON.parse(msg!.content.toString());
          channel.ack(msg!);
          await channel.close();
          resolve(response);
        }
      });
      channel.sendToQueue(queue[CardanoService], Buffer.from(JSON.stringify({
        data: {
          hash: assets[0].assetName,
          metadata: assets[0].metadata,
        },
        options: {
          skipWait: true,
        },
        type: "mint-token",
      }), "utf-8"), {
        replyTo,
        correlationId,
      });
      delay(TEN_MINUTES).then(async () => {
        await channel.close();
        reject(ERROR.TIMEOUT);
      });
    });
    const result = await promise;
    console.profileEnd("mint");
    return res.status(200).send(parseResult(result));
  } catch (error: any) {
    log.error("⛳️", error);
    return res.status(200).send(parseError(error));
  }
});

router.post("/api/v3/burn", async (req, res) => {
  const { assets } = req.body;
  try {
    const result = await burn({ assets });
    return res.status(200).send(parseResult(result));
  } catch (error: any) {
    log.error("⛳️", error);
    return res.status(200).send(parseError(error));
  }
});

router.get("/api/v3/fetch", async (req, res) => {
  const { policyId } = req.query;
  const fetchOptions: FetchOptions = {
    policyId: policyId as string
  };
  try {
    const result = await fetch(fetchOptions);
    return res.status(200).send(parseResult(result));
  } catch (error: any) {
    log.error("⛳️", error);
    return res.status(200).send(parseError(error));
  }
});

router.get("/api/health", (req, res) => {
  return res.status(200).send(parseResult({ error_message: "Server is running" }));
});

export default router;