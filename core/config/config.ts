export const MAX_NFT_PER_TX: number = 10;

export const TIME_TO_EXPIRE: string = "3153600000";
export const TEN_MINUTES: number = 10 * 60 * 1000;
export const ONE_HOUR: number = 60 * 60 * 1000;
export const ONE_MINUTE: number = 60 * 1000;
export const HALF_MINUTE: number = 30 * 1000;
export const FIVE_SECONDS: number = 5 * 1000;

export const PORT: number = Number(process.env?.PORT) || 3050;
export const BASE_PORT: number = 3050;
export const MAX_PORT: number = Number(process.env?.MAX_PORT) || 3050;

export const NETWORK_ID: number = Number(process.env?.NETWORK_ID || 0); // 0 for testnet, 1 for mainnet
export const NETWORK_NAME: string = process.env?.NETWORD_NAME || "preprod";

export const REDIS_PASSWORD: string = "c123@a56";
export const REDIS_PORT: number = 6379;

export const MNEMONIC_FILE: string = `${process.cwd()}/core/config/mnemonics.json`;
export const HOLDER_MNEMONIC: string = process.env?.HOLDER_MNEMONIC || "";
export const BURNER_MNEMONIC: string = process.env?.BURNER_MNEMONIC || "";

export const MAX_ATTEMPTS: number = 20;
