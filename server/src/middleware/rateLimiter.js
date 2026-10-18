// Lightweight, in-memory sliding window rate limiter for auth and general API endpoints
const rateLimitMap = new Map();

const createRateLimiter = (defaultMax = 5, namespace = 'default') => (options = {}) => {
  const windowMs = options.windowMs || 60 * 1000; // 1 minute
  const max = options.max || defaultMax;

  return (req, res, next) => {
    // In test environment, skip rate limiting to avoid test interference unless explicitly tested
    if (process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit']) {
      return next();
    }

    const rawIp = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || 'unknown';
    const key = `${namespace}:${rawIp}`;
    const now = Date.now();

    let clientRecord = rateLimitMap.get(key);
    if (!clientRecord) {
      clientRecord = { timestamps: [] };
      rateLimitMap.set(key, clientRecord);
    }

    // Filter out timestamps outside the sliding window
    clientRecord.timestamps = clientRecord.timestamps.filter((ts) => now - ts < windowMs);

    const remaining = Math.max(0, max - clientRecord.timestamps.length);
    const resetTime = Math.ceil((now + windowMs) / 1000);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetTime);

    if (clientRecord.timestamps.length >= max) {
      return res.status(429).json({
        message: 'Too many requests from this IP, please try again after 1 minute.',
        statusCode: 429
      });
    }

    clientRecord.timestamps.push(now);
    next();
  };
};

const authRateLimiter = createRateLimiter(5, 'auth');
const apiRateLimiter = createRateLimiter(100, 'api');
const chatbotRateLimiter = createRateLimiter(40, 'chatbot');

const resetRateLimits = () => rateLimitMap.clear();

module.exports = { authRateLimiter, apiRateLimiter, chatbotRateLimiter, resetRateLimits };

