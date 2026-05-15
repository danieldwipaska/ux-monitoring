# Integration Guide for React Applications

This guide will help you integrate the UX Monitoring logger into your React applications.

## Quick Start

### 1. Install Dependencies

```bash
npm install axios
```

### 2. Copy the Logger File

Copy `react-logger.js` to your React project (e.g., `src/utils/logger.js`)

### 3. Configure the Logger

Open the logger file and update these constants:

```javascript
const API_URL = "https://your-monitoring-app.com/api/logs"; // Your production URL
const API_KEY = "lm_xxxxxxxxxxxxx"; // Your API key from the dashboard
const APP_NAME = "my-react-app"; // Your application name
```

### 4. Use the Logger

Import and use the logger in your components:

```javascript
import { logger } from "./utils/logger";

function MyComponent() {
  useEffect(() => {
    logger.info("Component mounted");
  }, []);

  const handleClick = () => {
    logger.info("Button clicked", { buttonId: "submit" });
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

## Advanced Features

### Global Error Handler

Set up global error handling in your app's entry point (e.g., `index.js` or `App.js`):

```javascript
import { setupGlobalErrorHandler } from "./utils/logger";

// Call this once when your app starts
setupGlobalErrorHandler();
```

This will automatically log:

- Uncaught JavaScript errors
- Unhandled promise rejections

### Error Boundary

Wrap your app or specific components with the ErrorBoundary:

```javascript
import { ErrorBoundary } from "./utils/logger";

function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### Handling Token Expiration (Refresh Token)

The access token obtained using the API Key expires in 15 minutes. To ensure uninterrupted logging, your logger implementation should handle `401 Unauthorized` errors by automatically fetching a new access token using the `refreshToken`.

```javascript
// Example of axios interceptor or fetch wrapper
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Assume you saved refreshToken securely
        const refreshToken = localStorage.getItem("logger_refresh_token");
        
        const res = await axios.post("https://your-monitoring-app.com/api/auth/refresh", {
          refreshToken
        });
        
        const newAccessToken = res.data.accessToken;
        // Update your stored access token
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest); // Retry the failed log
      } catch (refreshError) {
        // Refresh token might be expired, need to use API Key again
        console.error("Failed to refresh token", refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```

## Best Practices

### 1. Log Levels

Use appropriate log levels:

- **info**: General information (user actions, successful operations)
- **warn**: Warning messages (deprecated features, non-critical issues)
- **error**: Error messages (failed operations, exceptions)
- **debug**: Debugging information (detailed execution flow)

### 2. Include Relevant Metadata

Always include relevant context in your logs:

```javascript
logger.error("Payment failed", {
  userId: user.id,
  amount: payment.amount,
  paymentMethod: payment.method,
  errorCode: error.code,
});
```

### 3. Avoid Logging Sensitive Data

Never log:

- Passwords
- Credit card numbers
- Personal identification numbers
- API keys or tokens
- Any other sensitive user data

### 4. Performance Considerations

The logger sends requests asynchronously and won't block your UI. However, for high-frequency events, consider:

- Debouncing or throttling logs
- Batching multiple logs together
- Using debug level for verbose logging

### 5. Environment-Specific Configuration

Use environment variables for configuration:

```javascript
const API_URL =
  process.env.REACT_APP_LOGGER_URL || "http://localhost:3000/api/logs";
const API_KEY = process.env.REACT_APP_LOGGER_API_KEY;
const APP_NAME = process.env.REACT_APP_NAME || "my-app";
```

Add to your `.env` file:

```env
REACT_APP_LOGGER_URL=https://your-monitoring-app.com/api/logs
REACT_APP_LOGGER_API_KEY=lm_xxxxxxxxxxxxx
REACT_APP_NAME=my-react-app
```

### 6. Disable Logging in Development

You can conditionally disable logging in development:

```javascript
class Logger {
  constructor(apiUrl, apiKey, appName) {
    this.enabled = process.env.NODE_ENV === "production";
    // ... rest of constructor
  }

  async sendLog(level, message, metadata = {}) {
    if (!this.enabled) {
      console.log(`[${level}] ${message}`, metadata);
      return;
    }
    // ... rest of sendLog
  }
}
```

## Common Use Cases

### 1. User Authentication

```javascript
// Login
logger.info("User login attempt", { email: user.email });

// Success
logger.info("User logged in successfully", { userId: user.id });

// Failure
logger.warn("Login failed", {
  email: user.email,
  reason: "invalid_credentials",
});
```

### 2. API Calls

```javascript
try {
  logger.debug("Fetching user data", { userId });
  const data = await fetchUser(userId);
  logger.info("User data fetched", {
    userId,
    dataSize: JSON.stringify(data).length,
  });
} catch (error) {
  logger.error("Failed to fetch user data", {
    userId,
    error: error.message,
    stack: error.stack,
  });
}
```

### 3. Form Submissions

```javascript
const handleSubmit = async (formData) => {
  logger.info("Form submission started", { formType: "contact" });

  try {
    await submitForm(formData);
    logger.info("Form submitted successfully", { formType: "contact" });
  } catch (error) {
    logger.error("Form submission failed", {
      formType: "contact",
      error: error.message,
    });
  }
};
```

### 4. Performance Monitoring

```javascript
useEffect(() => {
  const startTime = performance.now();

  loadData().then(() => {
    const duration = performance.now() - startTime;
    logger.info("Page loaded", {
      page: "dashboard",
      loadTime: `${duration.toFixed(2)}ms`,
    });
  });
}, []);
```

### 5. User Interactions

```javascript
const trackButtonClick = (buttonName) => {
  logger.info("Button clicked", {
    button: buttonName,
    page: window.location.pathname,
  });
};

const trackNavigation = (from, to) => {
  logger.info("Navigation", {
    from,
    to,
    timestamp: new Date().toISOString(),
  });
};
```

## Troubleshooting

### Logs Not Appearing in Dashboard

1. **Check API Key**: Ensure your API key is correct and active
2. **Check URL**: Verify the API URL is correct
3. **Check Network**: Open browser DevTools > Network tab to see if requests are being sent
4. **Check CORS**: Ensure your monitoring app allows requests from your React app's domain
5. **Check Rate Limits**: You might be hitting rate limits (1000 logs/minute per API key)
6. **Check Access Token**: Ensure your integration code is successfully exchanging the API Key for a JWT Access Token.

### CORS Issues

If you're getting CORS errors, you need to configure your Next.js app to allow requests from your React app's domain. Add this to `next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/(logs|auth/token|auth/refresh)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://your-react-app.com",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, x-api-key, Authorization",
          },
        ],
      },
    ];
  },
};
```

### Performance Impact

The logger is designed to have minimal performance impact:

- Requests are sent asynchronously
- Failed requests fail silently
- No blocking operations

If you notice performance issues:

1. Reduce logging frequency
2. Use debug level only in development
3. Implement request batching
4. Consider using a queue system

## Support

For issues or questions:

1. Check the main README.md
2. Review the API documentation
3. Check the troubleshooting section
4. Open an issue on GitHub

## License

This integration code is provided as-is for use with the UX Monitoring application.
