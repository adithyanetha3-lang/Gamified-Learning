/**
 * Centralized error handling middleware
 */

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";
  
  // Log error
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  
  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      message: err.message || "Internal server error",
      code: err.code || "INTERNAL_ERROR",
    },
  };
  
  // Include stack trace in development
  if (!isProduction) {
    errorResponse.error.stack = err.stack;
    errorResponse.error.details = err.details;
  }
  
  res.status(statusCode).json(errorResponse);
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: "NOT_FOUND",
    },
  });
}

// Custom error classes
export class ValidationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
    this.code = "VALIDATION_ERROR";
    this.details = details;
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
    this.statusCode = 401;
    this.code = "UNAUTHORIZED";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
    this.statusCode = 403;
    this.code = "FORBIDDEN";
  }
}
