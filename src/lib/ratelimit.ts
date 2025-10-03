import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const maxLimit = parseInt(process.env.RATE_LIMIT_MAX || '5', 10);

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(maxLimit, '1 d'),
  analytics: true,
  prefix: 'sorry-app',
});

export const RATE_LIMIT_MAX = maxLimit;
