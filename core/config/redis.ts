import { createClient } from "redis";
import { REDIS_PASSWORD, REDIS_PORT, REDIS_HOST } from ".";
import { Logger, ILogObj } from "tslog";

const log: Logger<ILogObj> = new Logger();

interface ICacheValue {
  key: string;
  value?: any;
  expiredTime?: number;
}

const redisClient = createClient({
  url: `redis://default:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`,
});

const constructRedisKey = ({ key }: ICacheValue) => {
  return process.env.NODE_ENV !== "test" ? key : `__test:${key}`;
};

async function pullFromCache({ key }: ICacheValue) {
  const data = await redisClient.get(key);
  return JSON.parse(data!);
}

async function getCacheValue({ key }: ICacheValue): Promise<any> {
  const cacheKey: string = constructRedisKey({ key });
  try {
    const data = await pullFromCache({ key: cacheKey });
    if (typeof data === "string" && data === "{}") {
      return undefined;
    }
    return data;
  } catch (error: any) {
    return undefined;
  }
}

const DEFAULT_EXPIRED_TIME: number = 60;

async function setCacheValue({
  key,
  value,
  expiredTime = DEFAULT_EXPIRED_TIME,
}: ICacheValue) {
  const cacheKey = constructRedisKey({ key });
  await redisClient.set(cacheKey, JSON.stringify(value));
  if (expiredTime! > 0) {
    await redisClient.expire(cacheKey!, expiredTime!);
  }
}

async function deleteCacheValue({ key }: ICacheValue) {
  const cacheKey = constructRedisKey({ key });
  await redisClient.del(cacheKey);
}

async function clearAllKeysFromCache() {
  await redisClient.flushAll();
}

async function getAllKeysFromCache() {
  return await redisClient.sendCommand(["keys", "*"]);
}

async function findKeysWithPrefix(prefix: string) {
  return await redisClient.keys(`${prefix}*`);
}

async function removeKeysWithPrefix(prefix: string) {
  const keys = await findKeysWithPrefix(prefix);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
}

async function increaseCacheValue({
  key,
  expiredTime = DEFAULT_EXPIRED_TIME,
}: ICacheValue) {
  const cacheKey = constructRedisKey({ key });
  const value = await redisClient.incr(cacheKey);
  if (expiredTime !== -1) {
    await redisClient.expire(cacheKey, expiredTime);
  }
  return value;
}

const connectRedis = async () => {
  try {
    log.debug("Connecting to redis ...");
    await redisClient.connect();
    log.debug("Redis client connected successfully");
    await redisClient.set("server", "Cardano Service");
  } catch (error) {
    log.error("Error while connecting to redis ...");
    log.error(error);
    throw error;
  }
};

await connectRedis();

export {
  connectRedis,
  getCacheValue,
  setCacheValue,
  deleteCacheValue,
  clearAllKeysFromCache,
  getAllKeysFromCache,
  findKeysWithPrefix,
  removeKeysWithPrefix,
  increaseCacheValue,
};
