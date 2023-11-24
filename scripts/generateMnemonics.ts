import { AppWallet } from "@meshsdk/core";
import { BASE_PORT, MAX_PORT } from "../core/config";

const mnemonics: string[] = [];
const NUMS = MAX_PORT - BASE_PORT + 1;

for (let i = 0; i < NUMS; ++i) {
  mnemonics.push(AppWallet.brew().join(" "));
}

await Bun.write(`${process.cwd()}/core/config/mnemonics2.json`, JSON.stringify({ mnemonics }, null, 2));