import redisClient from "./redisClient";

const setCacheSession = async (id: number) => {
  // redisClient.HSET(`session#${id}`, )
};
const getCacheSession = async (id: number) => {};
const deleteCacheBySessionId = async (id: number) => {};
const deleteCacheBySessionUser = async (user: number) => {};
