import { rateLimitError } from './errors';

interface RateBucket {
  timestamps: number[];
}

const globalForRateLimit = globalThis as typeof globalThis & {
  __DSA_RATE_LIMIT__?: Map<string, RateBucket>;
};

function getRateLimitMap(): Map<string, RateBucket> {
  if (!globalForRateLimit.__DSA_RATE_LIMIT__) {
    globalForRateLimit.__DSA_RATE_LIMIT__ = new Map<string, RateBucket>();
  }
  return globalForRateLimit.__DSA_RATE_LIMIT__;
}

export function enforceRateLimit(
  bucketKey: string,
  maxRequests: number,
  windowMs: number
): void {
  const now = Date.now();
  const map = getRateLimitMap();
  const entry = map.get(bucketKey) ?? { timestamps: [] };
  const active = entry.timestamps.filter((ts) => now - ts < windowMs);

  if (active.length >= maxRequests) {
    throw rateLimitError(
      'Bạn đã gửi quá nhiều yêu cầu trong thời gian ngắn. Vui lòng đợi một lát.'
    );
  }

  active.push(now);
  map.set(bucketKey, { timestamps: active });
}
