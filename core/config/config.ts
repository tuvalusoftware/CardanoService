export const MAX_NFT_PER_TX: number = 20;

export const TIME_TO_EXPIRE: string = "3153600000";
export const TEN_MINUTES: number = 10 * 60 * 1000;

export const PORT: number = Number(process?.env?.PORT) || 3050;
export const BASE_PORT: number = 3050;

export const NETWORK_ID: number = Number(process?.env?.NETWORK_ID) || 0; // 0 for testnet, 1 for mainnet

export const REDIS_PASSWORD: string = "c123@a56";
export const REDIS_PORT: number = 6379;