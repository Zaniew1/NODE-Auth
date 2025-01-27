import { createClient, RedisClientType } from 'redis';
import { REDIS_HOST, REDIS_PORT, REDIS_PASS, REDIS_ON } from '../utils/constants/env';

let redisClient;
if (REDIS_ON == 'true') {
  redisClient = connectRedis();
}
/**
 * This function creates connection with redis cloud
 *
 * @export
 * @returns {*}
 */
export function connectRedis() {
  const redisClient = createClient({
    socket: {
      host: REDIS_HOST,
      port: parseInt(REDIS_PORT),
    },
    password: REDIS_PASS,
  });
  redisClient.on('error', (err: Error) => console.error(err));
  redisClient.connect();
  return redisClient;
}
export default redisClient as RedisClientType;
