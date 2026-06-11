/**
 * Security middleware for the API server
 */

// Simple rate limiter implementation
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = process.env.RATE_LIMIT_MAX || 100;

export function rateLimiter(req, res, next) {
  const identifier = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!requestCounts.has(identifier)) {
    requestCounts.set(identifier, []);
  }
  
  const requests = requestCounts.get(identifier);
  
  // Remove old requests outside the window
  const validRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (validRequests.length >= MAX_REQUESTS) {
    return res.status(429).json({
      error: "Too many requests",
      message: "Please try again later",
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000),
    });
  }
  
  validRequests.push(now);
  requestCounts.set(identifier, validRequests);
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up
    for (const [key, times] of requestCounts.entries()) {
      if (times.length === 0 || now - times[times.length - 1] > RATE_LIMIT_WINDOW) {
        requestCounts.delete(key);
      }
    }
  }
  
  next();
}

export function securityMiddleware(req, res, next) {
  // Security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Remove powered by header
  res.removeHeader("X-Powered-By");
  
  next();
}

// Input sanitization helper
export function sanitizeInput(input) {
  if (typeof input === "string") {
    return input
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .substring(0, 10000); // Limit length
  }
  return input;
}
