import { blockchainProvider } from "../provider";
import { Logger, ILogObj } from "tslog";
export { parseError, parseResult, parseJson } from "./parse";

const log: Logger<ILogObj> = new Logger();

export const getOrDefault = <T>(value: T | undefined, defaultValue: T): T => {
  try {
    return value === undefined ? defaultValue : value;
  } catch (error: any) {
    return defaultValue;
  }
}

export const waitForTransaction = async (txHash: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    blockchainProvider.onTxConfirmed(txHash, () => {
      log.info("🐳 Transaction confirmed", txHash);
      resolve();
    }, 15);
  });
}

/* -----------------[ Others ]----------------- */

export const assertEqual = (a: Boolean, b: Boolean, message: any): void => {
  if (a !== b) {
    log.error("🚨", message);
    throw message;
  }
}