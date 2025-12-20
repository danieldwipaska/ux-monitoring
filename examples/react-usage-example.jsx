/**
 * Example usage of the UX Monitoring Logger in a React application
 */

import React, { useEffect, useState } from 'react';
import { logger, setupGlobalErrorHandler, ErrorBoundary } from './react-logger';

// Setup global error handler when app starts
setupGlobalErrorHandler();

// Example 1: Basic logging in a component
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.info('UserProfile component mounted', { userId });

    fetchUser(userId);

    return () => {
      logger.debug('UserProfile component unmounted', { userId });
    };
  }, [userId]);

  const fetchUser = async (id) => {
    try {
      logger.info('Fetching user data', { userId: id });
      
      const response = await fetch(`/api/users/${id}`);
      const data = await response.json();
      
      setUser(data);
      setLoading(false);
      
      logger.info('User data fetched successfully', { userId: id });
    } catch (error) {
      logger.error('Failed to fetch user data', {
        userId: id,
        error: error.message,
        stack: error.stack,
      });
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// Example 2: Logging user interactions
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    logger.info('Login attempt started', { email });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        logger.info('Login successful', { email });
        // Redirect or update state
      } else {
        logger.warn('Login failed', { 
          email, 
          status: response.status,
          statusText: response.statusText 
        });
      }
    } catch (error) {
      logger.error('Login error', {
        email,
        error: error.message,
        stack: error.stack,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}

// Example 3: Logging performance metrics
function Dashboard() {
  useEffect(() => {
    const startTime = performance.now();
    
    logger.info('Dashboard loading started');

    // Simulate data loading
    loadDashboardData().then(() => {
      const loadTime = performance.now() - startTime;
      
      logger.info('Dashboard loaded', {
        loadTime: `${loadTime.toFixed(2)}ms`,
        performanceMetrics: {
          navigation: performance.getEntriesByType('navigation')[0],
          memory: performance.memory,
        },
      });
    });
  }, []);

  const loadDashboardData = async () => {
    // Your data loading logic
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return <div>Dashboard Content</div>;
}

// Example 4: Using Error Boundary
function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong. Please refresh the page.</div>}>
      <div className="App">
        <Dashboard />
        <UserProfile userId="123" />
        <LoginForm />
      </div>
    </ErrorBoundary>
  );
}

// Example 5: Logging custom events
function ShoppingCart() {
  const addToCart = (product) => {
    logger.info('Product added to cart', {
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
    });
    
    // Your add to cart logic
  };

  const checkout = (cartItems) => {
    logger.info('Checkout initiated', {
      itemCount: cartItems.length,
      totalAmount: cartItems.reduce((sum, item) => sum + item.price, 0),
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
      })),
    });
    
    // Your checkout logic
  };

  return (
    <div>
      {/* Your shopping cart UI */}
    </div>
  );
}

// Example 6: Logging API errors with retry logic
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      logger.debug(`API request attempt ${i + 1}`, { url });
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      logger.info('API request successful', { url, attempt: i + 1 });
      return await response.json();
      
    } catch (error) {
      logger.warn(`API request failed (attempt ${i + 1}/${maxRetries})`, {
        url,
        error: error.message,
        attempt: i + 1,
      });
      
      if (i === maxRetries - 1) {
        logger.error('API request failed after all retries', {
          url,
          error: error.message,
          maxRetries,
        });
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

export default App;
