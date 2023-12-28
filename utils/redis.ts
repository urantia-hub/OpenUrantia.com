// redisClient.ts
import Redis from "ioredis";

class RedisClient {
  private static instance: Redis | null = null;

  private constructor() {
    // Private constructor to prevent direct instantiation.
  }

  public static getInstance(): Redis {
    if (!this.instance) {
      if (!process.env.REDIS_URL) {
        throw new Error("REDIS_URL is not defined");
      }
      this.instance = new Redis(process.env.REDIS_URL);
    }
    return this.instance;
  }
}

export default RedisClient;
