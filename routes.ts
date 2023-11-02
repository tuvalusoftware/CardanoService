import express, { Router } from "express";
import { parseError, parseResult } from "./core/utils";
import { Logger, ILogObj } from "tslog";
import { burn, mint, fetch } from "./core";
import { FetchOptions, getVersion } from "./core/fetch";

const log: Logger<ILogObj> = new Logger();

const router: Router = express.Router();

/* -----------------[ V3 ]----------------- */

router.post("/api/v3/mint", async (req, res) => {
  const { assets } = req.body;
  try {
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