# cardanoservice

To install dependencies:

```bash
bun install
```

Pre-requisites:

1. Generate a mnemonic phrase
  
```bash
bun scripts/generateMnemonics.ts
```

2. Send ADA to the address generated in the previous step

```bash
bun scripts/sendAda.ts
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
