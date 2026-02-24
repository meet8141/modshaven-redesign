// Simple in-memory cache utility for API routes

const cache: Record<string, { value: any; expires: number }> = {};

export function setCache(key: string, value: any, ttl: number) {
  cache[key] = { value, expires: Date.now() + ttl };
}

export function getCache(key: string) {
  const entry = cache[key];
  if (entry && entry.expires > Date.now()) {
    return entry.value;
  }
  delete cache[key];
  return null;
}
