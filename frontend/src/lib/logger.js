/**
 * Frontend Logger Utility
 */
const Logger = {
  info: (msg, ...args) => {
    if (import.meta.env.DEV) {
      console.log(`[INFO] ${msg}`, ...args);
    }
  },
  warn: (msg, ...args) => {
    console.warn(`[WARN] ${msg}`, ...args);
  },
  error: (msg, ...args) => {
    console.error(`[ERROR] ${msg}`, ...args);
  },
  uiError: (componentName, error, stack) => {
    console.error(`[UI Error in ${componentName}]:`, error, stack);
  }
};

export default Logger;
