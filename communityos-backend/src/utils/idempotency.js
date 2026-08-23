import { v4 as uuidv4 } from 'uuid';
import { getRedisClient } from '../config/redis.js';

export function generateIdempotencyKey() {
  return uuidv4();
}

export async function checkIdempotency(key, ttl = 3600) {
  const redis = getRedisClient();

  const existing = await redis.get(`idempotency:${key}`);
  if (existing) {
    return JSON.parse(existing);
  }

  return null;
}

export async function storeIdempotencyResult(key, result, ttl = 3600) {
  const redis = getRedisClient();
  await redis.setEx(`idempotency:${key}`, ttl, JSON.stringify(result));
}
