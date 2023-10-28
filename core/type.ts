import {
  AppWallet,
  Transaction,
  ForgeScript,
  MaestroProvider,
  BlockfrostProvider,
  resolveTxHash,
  resolvePaymentKeyHash,
  resolveSlotNo,
  parseAssetUnit,
  keepRelevant,
} from "@meshsdk/core";
import type { Mint, AssetMetadata, Asset, NativeScript, UTxO, PlutusScript } from "@meshsdk/core";

export interface MintParams {
  assetName: string;
  forgingScript?: ForgeScript;
  metadata?: AssetMetadata;
}

export interface BurnParams {
  unit: string;
  forgingScript: ForgeScript;
  policyId?: string;
  assetName?: string;
  removeCollection?: boolean;
}

export interface MintResult {
  txHash: string;
  assets: {
    [key: string]: {
      unit: string,
      forgingScript: ForgeScript,
      policyId?: string,
      assetName?: string,
    };
  }
}

export interface BurnResult {
  txHash: string;
}

export interface Options {
  skipWait?: boolean;
};