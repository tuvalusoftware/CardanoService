import { FIVE_SECONDS, ONE_MINUTE } from "../config";
import { blockchainProvider } from "../provider";
import { Logger, ILogObj } from "tslog";
export { parseError, parseResult, parseJson } from "./parse";

const log: Logger<ILogObj> = new Logger();

export const getOrDefault = <T>(value: T | undefined, defaultValue: T): T => {
  try {
    return value ?? defaultValue;
  } catch (error: any) {
    return defaultValue;
  }
};

export const getDateNow = (): number => {
  return new Date().getTime();
};

export const wait = async (
  condition: () => boolean,
  timeout: number = ONE_MINUTE,
  interval: number = FIVE_SECONDS
): Promise<void> => {
  const startTime: number = getDateNow();
  while (getDateNow() - startTime < timeout) {
    if (condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error("Timeout");
};

export const waitUntil = async (to: number): Promise<void> => {
  const now: number = getDateNow();
  if (now < to) {
    await wait(() => getDateNow() >= to);
  }
};

export const waitForTransaction = async (txHash: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    blockchainProvider.onTxConfirmed(
      txHash,
      () => {
        log.info("🐳 Transaction confirmed", txHash);
        resolve();
      },
      15
    );
  });
};

export const delay = async (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/* -----------------[ Others ]----------------- */

export const assertEqual = (a: Boolean, b: Boolean, message: any): void => {
  if (a !== b) {
    log.error("🚨", message);
    throw message;
  }
};
