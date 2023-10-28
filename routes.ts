import express from "express";
import { parseError, parseResult } from "./core/error";
import { Logger, ILogObj } from "tslog";
import { burn, mint } from "./core";

const log: Logger<ILogObj> = new Logger();

const router = express.Router();

/* -----------------[ V3 ]----------------- */

router.post("/api/v3/mint", async (req, res) => {
  // const { assets } = req.body;
  try {
    const assets = [];
    for (let i = 20; i < 30; i++) {
      assets.push({
        assetName: `asset${i}`,
      });
    }
    const result = await mint({ assets });
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

router.get("/api/health", (req, res) => {
  return res.status(200).send(parseResult({ message: "Server is running" }));
});

export default router;