import type { Mint, Asset } from "@meshsdk/core";
import csl from "@emurgo/cardano-serialization-lib-nodejs";

/* -----------------[ UTF-8 ]----------------- */

export const fromUTF8 = (utf8: string) => {
  if (utf8.length % 2 === 0 && /^[0-9A-F]*$/i.test(utf8)) return utf8;

  return fromBytes(Buffer.from(utf8, "utf-8"));
};

export const toUTF8 = (hex: string) =>
  Buffer.from(hex, "hex").toString("utf-8");

/* -----------------[ Bytes ]----------------- */

export const fromBytes = (bytes: Uint8Array) =>
  Buffer.from(bytes).toString("hex");

export const toBytes = (hex: string): Uint8Array => {
  if (hex.length % 2 === 0 && /^[0-9A-F]*$/i.test(hex))
    return Buffer.from(hex, "hex");

  return Buffer.from(hex, "utf-8");
};

/* -----------------[ Lovelace ]----------------- */

export const fromLovelace = (lovelace: number) => lovelace / 1_000_000;

export const toLovelace = (ada: number) => ada * 1_000_000;

export const deserializeNativeScript = (nativeScript: string) =>
  csl.NativeScript.from_bytes(toBytes(nativeScript));

export const toAsset = (
  forgeScript: string,
  mint: Mint
): Asset & { policyId: string } => {
  const policyId = deserializeNativeScript(forgeScript).hash().to_hex();

  const assetName = fromUTF8(mint.assetName);

  return {
    unit: `${policyId}${assetName}`,
    quantity: mint.assetQuantity,
    policyId,
  };
};
