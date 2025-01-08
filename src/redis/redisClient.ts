import { createClient } from "redis";
import { REDIS_HOST, REDIS_PORT, REDIS_PASS } from "../utils/constants/env";
const redisClient = createClient({
  socket: {
    host: REDIS_HOST,
    port: parseInt(REDIS_PORT),
  },
  password: REDIS_PASS,
});
redisClient.on("error", (err: Error) => console.error(err));
redisClient.connect();

export default redisClient;
