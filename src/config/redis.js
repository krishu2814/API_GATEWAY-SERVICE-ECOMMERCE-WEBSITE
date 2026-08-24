const Redis = require("ioredis");
const { REDIS_URL } = require("./serverConfig");

let redisClient = null;

function getRedisClient() {
  if (!redisClient) {
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
      reconnectOnError(err) {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });

    redisClient.on("connect", () => {
      console.log("[Redis] API Gateway connected to Redis successfully");
    });

    redisClient.on("error", (err) => {
      console.error("[Redis Error] API Gateway Redis error:", err.message);
    });
  }

  return redisClient;
}

module.exports = {
  getRedisClient,
};
