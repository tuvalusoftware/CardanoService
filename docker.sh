# RabbitMQ
docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.12-management

# Redis
docker run -it --rm --name cardano-redis -d -p 6379:6379 redis:latest redis-server --requirepass "c123@a56"