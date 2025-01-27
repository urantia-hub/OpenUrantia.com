import { Redis } from "ioredis";

let redis: Redis;

export const getRedisClient = () => {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
  }
  return redis;
};

// Cache duration of 1 week in seconds
export const ONE_WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

// Helper function to generate cache keys
export const getCacheKey = (
  prefix: string,
  params: Record<string, any> = {}
) => {
  const sortedParams = Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}:${value}`)
    .join(":");
  return `${prefix}:${sortedParams}`;
};
