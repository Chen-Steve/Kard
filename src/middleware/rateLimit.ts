import rateLimit from 'express-rate-limit';

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests, please try again later.',
    });
  },
});

export default rateLimiter;