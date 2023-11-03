import { AppWallet } from "@meshsdk/core";

const mnemonics: string[] = [];

for (let i = 0; i < 20; ++i) {
  mnemonics.push(AppWallet.brew().join(" "));
}

await Bun.write(`${process.cwd()}/core/config/mnemonics2.json`, JSON.stringify({ mnemonics }, null, 2));