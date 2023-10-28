export const MAX_NFT_PER_TX = 30;

export const TIME_TO_EXPIRE = "3153600000";

export const TEN_MINUTES = 10 * 60 * 1000;

export const PORT = Number(process?.env?.PORT) || 8095;
export const BASE_PORT = 8095;

export const NETWORK_ID = Number(process?.env?.NETWORK_ID) || 0; // 0 for testnet, 1 for mainnet