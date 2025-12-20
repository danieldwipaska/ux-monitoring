/**
 * UX Monitoring Logger for React Applications
 * 
 * This is an example logger utility that you can use in your React applications
 * to send logs to the UX Monitoring dashboard.
 * 
 * Installation:
 * npm install axios
 * 
 * Usage:
 * 1. Copy this file to your React project
 * 2. Update the API_URL and API_KEY constants
 * 3. Import and use the logger in your components
 */

import axios from 'axios';

// Configuration
const API_URL = 'http://localhost:3000/api/logs'; // Change to your production URL
const API_KEY = 'your-api-key-here'; // Replace with your actual API key from the dashboard
const APP_NAME = 'my-react-app'; // Change to your app name

// Logger class
class Logger {
  constructor(apiUrl, apiKey, appName) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.appName = appName;
    this.queue = [];
    this.isProcessing = false;
  }

  /**
   * Send a log to the server
   * @private
   */
  async sendLog(level, message, metadata = {}) {
    try {
      await axios.post(
        this.apiUrl,
        {
          level,
          message,
          source: this.appName,
          metadata: {
            ...metadata,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
          },
        }
      );
    } catch (error) {
      // Silently fail to avoid infinite loops
      console.error('Failed to send log:', error.message);
    }
  }

  /**
   * Log an info message
   * @param {string} message - The log message
   * @param {object} metadata - Additional metadata
   */
  info(message, metadata = {}) {
    this.sendLog('info', message, metadata);
  }

  /**
   * Log a warning message
   * @param {string} message - The log message
   * @param {object} metadata - Additional metadata
   */
  warn(message, metadata = {}) {
    this.sendLog('warn', message, metadata);
  }

  /**
   * Log an error message
   * @param {string} message - The log message
   * @param {object} metadata - Additional metadata
   */
  error(message, metadata = {}) {
    this.sendLog('error', message, metadata);
  }

  /**
   * Log a debug message
   * @param {string} message - The log message
   * @param {object} metadata - Additional metadata
   */
  debug(message, metadata = {}) {
    this.sendLog('debug', message, metadata);
  }

  /**
   * Log an exception with stack trace
   * @param {Error} error - The error object
   * @param {object} metadata - Additional metadata
   */
  exception(error, metadata = {}) {
    this.error(error.message, {
      ...metadata,
      stack: error.stack,
      name: error.name,
    });
  }
}

// Create and export logger instance
export const logger = new Logger(API_URL, API_KEY, APP_NAME);

// Global error handler (optional)
export function setupGlobalErrorHandler() {
  window.addEventListener('error', (event) => {
    logger.error('Uncaught error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
      reason: event.reason?.message || event.reason,
      stack: event.reason?.stack,
    });
  });
}

// React Error Boundary (optional)
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('React Error Boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

export default logger;
