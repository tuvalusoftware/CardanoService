# cardanoservice

Environment variables:

```
# PORT=3050
# BASE_PORT=3050
# MAX_PORT=3050
# NODE_ENV=development
# CHANNEL_NAME=CardanoService

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

Pre-requisites:

- Redis
- RabbitMQ
- Docker
- Bun

**Make sure `SENDER_ADA` has enough ADA to send to the user**

Step 0. Install docker and docker-compose
Step 1. Run `build.sh`
Step 2. Run `docker-compose up -d`
Step 2.1. Run `send-ada.sh` to send ADA to each container
Step 3. Run `docker-compose logs -f` to see logs
