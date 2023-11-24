# cardanoservice

Environment variables:

```
PORT=3050
MAX_PORT=3050
NODE_ENV=development
CHANNEL_NAME=CardanoService
NETWORD_NAME=preprod

SENDER_ADA=""

HOLDER_MNEMONIC=""
BURNER_MNEMONIC=""

REDIS_PASSWORD=""
REDIS_HOST="cardanoredis"
REDIS_PORT="6379"

RABBITMQ_DEFAULT_USER=""
RABBITMQ_DEFAULT_PASS=""
RABBITMQ_DEFAULT_VHOST="cardanorabbitmq"
RABBITMQ_DEFAULT_PORT="5672"
```

To install dependencies:

```bash
bun install
```

Pre-requisites:

1. Generate a mnemonic phrase
  
```bash
bun scripts/generateMnemonics.ts
```

Ensure that `MNEMONIC_FILE` in `core/config.ts` is matching the file generated in the script above.

1. Send ADA to the address generated in the previous step

Please make sure `SENDER_ADA` has enough ADA to send to the address generated in the previous step.

```bash
bun scripts/sendAda.ts
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
