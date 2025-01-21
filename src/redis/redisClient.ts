import { createClient } from "redis";
import { REDIS_HOST, REDIS_PORT, REDIS_PASS, REDIS_ON } from "../utils/constants/env";
const redisClient = createClient({
  socket: {
    host: REDIS_HOST,
    port: parseInt(REDIS_PORT),
  },
  password: REDIS_PASS,
});
if (REDIS_ON == "true") {
  redisClient.on("error", (err: Error) => console.error(err));
  redisClient.connect();
}

export default redisClient;
