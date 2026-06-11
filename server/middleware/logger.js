/**
 * Request logging middleware
 */

const isProduction = process.env.NODE_ENV === "production";

export function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Log request
  if (!isProduction) {
    console.log(`→ ${req.method} ${req.path}`);
  }
  
  // Log response when finished
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? "error" : "info";
    
    const logMessage = `${req.method} ${req.path} ${res.statusCode} ${duration}ms`;
    
    if (logLevel === "error") {
      console.error(`✗ ${logMessage}`);
    } else if (!isProduction) {
      console.log(`✓ ${logMessage}`);
    }
  });
  
  next();
}
