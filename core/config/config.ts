export const MAX_NFT_PER_TX: number = 10;

export const TIME_TO_EXPIRE: string = "3153600000";
export const TEN_MINUTES: number = 10 * 60 * 1000;
export const ONE_HOUR: number = 60 * 60 * 1000;
export const ONE_MINUTE: number = 60 * 1000;
export const HALF_MINUTE: number = 30 * 1000;
export const FIFTEEN_SECONDS: number = 15 * 1000;
export const TEN_SECONDS: number = 10 * 1000;
export const FIVE_SECONDS: number = 5 * 1000;
export const TWO_SECONDS: number = 2 * 1000;

export const PORT: number = Number(process.env?.PORT) || 3050;
export const BASE_PORT: number = Number(process.env?.BASE_PORT) || 3050;
export const MAX_PORT: number = Number(process.env?.MAX_PORT) || 3050;

export const NETWORK_ID: number = Number(process.env?.NETWORK_ID ?? 0); // 0 for testnet, 1 for mainnet
export const NETWORK_NAME: string = process.env?.NETWORK_NAME ?? "preprod";

export const REDIS_PASSWORD: string = process.env?.REDIS_PASSWORD ?? "";
export const REDIS_PORT: number = Number(process.env?.REDIS_PORT ?? 6379);
export const REDIS_HOST: string = process.env?.REDIS_HOST ?? "localhost";

export const RABBITMQ_DEFAULT_VHOST: string =
  process.env?.RABBITMQ_DEFAULT_VHOST ?? "localhost";
export const RABBITMQ_DEFAULT_USER: string =
  process.env?.RABBITMQ_DEFAULT_USER ?? "guest";
export const RABBITMQ_DEFAULT_PASS: string =
  process.env?.RABBITMQ_DEFAULT_PASS ?? "guest";
export const RABBITMQ_DEFAULT_PORT: number = Number(
  process.env?.RABBITMQ_DEFAULT_PORT ?? 5672
);

export const MNEMONIC_FILENAME: string =
  process.env?.MNEMONIC_FILENAME ?? "mnemonic";
export const MNEMONIC_FILE: string = `${process.cwd()}/core/config/${MNEMONIC_FILENAME}.json`;
export const HOLDER_MNEMONIC: string = process.env?.HOLDER_MNEMONIC ?? "";
export const BURNER_MNEMONIC: string = process.env?.BURNER_MNEMONIC ?? "";

export const MAESTRO_API_KEY: string = process.env?.MAESTRO_API_KEY ?? "";
export const BLOCKFORST_API_KEY: string = process.env?.BLOCKFORST_API_KEY ?? "";

export const MAX_ATTEMPTS: number = Number(process.env?.MAX_ATTEMPTS ?? 10);
export const CARDANO_NFT_LABEL: string =
  process.env?.CARDANO_NFT_LABEL ?? "721";

export const SENDGRID_API_KEY: string = process.env?.SENDGRID_API_KEY ?? "";
