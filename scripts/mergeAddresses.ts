import fs from "fs";
import { assertEqual } from "../core/utils";

const readFile = async (path: string) => {
  const file = Bun.file(path);
  const contents = await file.json();
  return contents;
}

const checkExists = async (path: string) => {
  const file = Bun.file(path);
  return await file.exists();
}

const writeFile = async (path: string, contents: any) => {
  await Bun.write(Bun.file(path), JSON.stringify(contents, null, 2));
}

const listMnemonics = new Set<string>();

fs.readdirSync(`${process.cwd()}/backup/`).forEach(async fileName => {
  const path = `${process.cwd()}/backup/${fileName}`;
  const exists = await checkExists(path);
  assertEqual(exists, true, `File ${path} does not exist`);
  const contents = await readFile(path);
  const mnemonics = contents!.mnemonics!;
  mnemonics!.forEach((mnemonic: string) => {
    console.log(mnemonic);
    listMnemonics.add(mnemonic);
  });
});

console.log("Waiting 5 seconds...");
await Bun.sleep(5000);

console.log("Mnemonics:");
console.log(listMnemonics);

fs.readdirSync(`${process.cwd()}/backup/`).forEach(async fileName => {
  const path = `${process.cwd()}/backup/${fileName}`;
  const exists = await checkExists(path);
  assertEqual(exists, true, `File ${path} does not exist`);
  const contents = await readFile(path);
  const mnemonics = contents!.mnemonics!;
  mnemonics!.push(...[...listMnemonics].filter(mnemonic => !mnemonics!.includes(mnemonic)));
  await writeFile(path, contents);
});

console.log("Done!");