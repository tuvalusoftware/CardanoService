import * as dotenv from "dotenv";
dotenv.config();

import { cleanEnv, str, num } from "envalid";

const validateEnv = () => {
    cleanEnv(process.env, {
        CORS_DOMAINS: str(),
        PREPROD_BLOCKFROST_APIKEY: str(),
        CARDANO_NETWORK: num(),
        AUTH_SERVER: str(),
        MNEMONIC: str(),
        PROD_MNEMONIC: str(),
        CRYPTO_SECRET_PASSWORD: str(),
        CRYPTO_SECRET_PASSWORD_HASH: str(),
        CRYPTO_SECRET_PASSWORD_IV: str(),
        ENVIRONMENT: str(),
        DEVELOP_MNEMONIC: str()
    });
};

export { validateEnv };