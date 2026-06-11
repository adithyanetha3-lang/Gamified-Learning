/**
 * Centralized logging utility for the application
 * In production, these can be sent to external logging services
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = import.meta.env.PROD ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;

class Logger {
  constructor(context = "App") {
    this.context = context;
  }

  _log(level, levelName, ...args) {
    if (level < currentLevel) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${levelName}] [${this.context}]`;

    console[levelName.toLowerCase()] || console.log(prefix, ...args);

    // In production, send to external service
    if (import.meta.env.PROD && level >= LOG_LEVELS.ERROR) {
      // this._sendToExternalService(level, levelName, args);
    }
  }

  debug(...args) {
    this._log(LOG_LEVELS.DEBUG, "DEBUG", ...args);
  }

  info(...args) {
    this._log(LOG_LEVELS.INFO, "INFO", ...args);
  }

  warn(...args) {
    this._log(LOG_LEVELS.WARN, "WARN", ...args);
  }

  error(...args) {
    this._log(LOG_LEVELS.ERROR, "ERROR", ...args);
  }

  // Helper for timing operations
  time(label) {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.time(`[${this.context}] ${label}`);
    }
  }

  timeEnd(label) {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.timeEnd(`[${this.context}] ${label}`);
    }
  }
}

// Create logger instances for different modules
export const createLogger = (context) => new Logger(context);
export const defaultLogger = new Logger("App");

export default Logger;
