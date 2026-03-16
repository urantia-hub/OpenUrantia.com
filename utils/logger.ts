type LogLevel = "info" | "warn" | "error";

function createLogger(module: string) {
  return {
    info: (message: string, data?: Record<string, unknown>) =>
      console.log(`[${module}]`, message, data ?? ""),
    warn: (message: string, data?: Record<string, unknown>) =>
      console.warn(`[${module}]`, message, data ?? ""),
    error: (message: string, error?: unknown, data?: Record<string, unknown>) =>
      console.error(`[${module}]`, message, error, data ?? ""),
  };
}

export default createLogger;
