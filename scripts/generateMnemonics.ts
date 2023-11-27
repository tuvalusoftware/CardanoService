import { AppWallet } from "@meshsdk/core";
import { MNEMONIC_FILENAME } from "../core/config";

const mnemonics: string[] = [];

for (let i = 0; i < 1; ++i) {
  mnemonics.push(AppWallet.brew().join(" "));
}

await Bun.write(`${process.cwd()}/core/config/${MNEMONIC_FILENAME}.json`, JSON.stringify({ mnemonics }, null, 2));