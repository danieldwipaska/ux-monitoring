# UX Monitoring - Log Management Dashboard

A modern, fullstack log monitoring application built with Next.js, MongoDB, and TailwindCSS. This application allows you to collect, store, and visualize logs from multiple React applications with authentication, API key management, and rate limiting.

## ✨ Features

- **📊 Real-time Log Monitoring**: View and filter logs from all your applications in one place
- **🔐 Authentication & Authorization**: Secure JWT-based authentication system
- **🔑 API Key Management**: Generate and manage API keys for your applications
- **⚡ Rate Limiting**: Built-in rate limiting to protect your API endpoints
- **📈 Statistics Dashboard**: Visual analytics and insights for your logs
- **🎨 Modern UI**: Beautiful, responsive interface built with TailwindCSS
- **🔍 Advanced Filtering**: Filter logs by level, source, and search messages
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud like MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:

```bash
cd ux-monitoring
```

2. **Install dependencies**:

```bash
npm install
```

3. **Set up environment variables**:

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Local Connection
MONGODB_URI=mongodb://localhost:27017/ux-monitoring

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# NextAuth (optional, for future extensions)
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. **Run the development server**:

```bash
npm run dev
```

5. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Initial Setup

1. **Register an account**: Navigate to the login page and click "Register" to create your account
2. **Create an API Key**: Go to the "API Keys" section in the dashboard and create your first API key
3. **Integrate with your React app**: Use the API key to send logs from your React applications

### Sending Logs from Your React Application

Install axios or use fetch in your React application:

```bash
npm install axios
```

Create a logger utility:

```javascript
// logger.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/logs';
const API_KEY = 'your-api-key-here'; // Replace with your actual API key

export const logger = {
  info: (message, metadata = {}) => {
    sendLog('info', message, metadata);
  },
  warn: (message, metadata = {}) => {
    sendLog('warn', message, metadata);
  },
  error: (message, metadata = {}) => {
    sendLog('error', message, metadata);
  },
  debug: (message, metadata = {}) => {
    sendLog('debug', message, metadata);
  },
};

async function sendLog(level, message, metadata) {
  try {
    await axios.post(
      API_URL,
      {
        level,
        message,
        source: 'my-react-app', // Change this to your app name
        metadata,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
      }
    );
  } catch (error) {
    console.error('Failed to send log:', error);
  }
}
```

Use the logger in your React components:

```javascript
import { logger } from './logger';

function MyComponent() {
  const handleClick = () => {
    logger.info('Button clicked', { buttonId: 'submit-btn' });
    
    try {
      // Your code here
    } catch (error) {
      logger.error('Error in MyComponent', { 
        error: error.message,
        stack: error.stack 
      });
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

## 🔌 API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Logout
```http
POST /api/auth/logout
```

#### Get Current User
```http
GET /api/auth/me
Cookie: auth-token=<jwt-token>
```

### API Keys

#### Get All API Keys
```http
GET /api/api-keys
Cookie: auth-token=<jwt-token>
```

#### Create API Key
```http
POST /api/api-keys
Cookie: auth-token=<jwt-token>
Content-Type: application/json

{
  "name": "My React App"
}
```

#### Delete API Key
```http
DELETE /api/api-keys/:id
Cookie: auth-token=<jwt-token>
```

#### Toggle API Key Status
```http
PATCH /api/api-keys/:id
Cookie: auth-token=<jwt-token>
Content-Type: application/json

{
  "isActive": false
}
```

### Logs

#### Create Log (from your React app)
```http
POST /api/logs
x-api-key: <your-api-key>
Content-Type: application/json

{
  "level": "info",
  "message": "User logged in",
  "source": "my-react-app",
  "metadata": {
    "userId": "123",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

#### Get Logs (dashboard)
```http
GET /api/logs?page=1&limit=50&level=error&source=my-app&search=query
Cookie: auth-token=<jwt-token>
```

#### Get Log Statistics
```http
GET /api/logs/stats?hours=24
Cookie: auth-token=<jwt-token>
```

## 🛡️ Security Features

### Rate Limiting

The application includes built-in rate limiting:

- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **Log creation**: 1000 requests per minute per API key
- **General API**: 100 requests per minute per IP

### Authentication

- JWT-based authentication with HTTP-only cookies
- Bcrypt password hashing with salt rounds of 12
- Secure session management

### API Key Security

- API keys are prefixed with `lm_` for easy identification
- Keys are stored securely in MongoDB
- Can be activated/deactivated without deletion
- Last used timestamp tracking

## 📁 Project Structure

```
ux-monitoring/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── register/route.ts
│   │   │   └── me/route.ts
│   │   ├── api-keys/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   └── logs/
│   │       ├── route.ts
│   │       └── stats/route.ts
│   ├── dashboard/
│   │   ├── api-keys/page.tsx
│   │   ├── stats/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── login/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── Navbar.tsx
├── lib/
│   ├── auth.ts
│   ├── middleware.ts
│   ├── mongodb.ts
│   └── rate-limiter.ts
├── models/
│   ├── ApiKey.ts
│   ├── Log.ts
│   └── User.ts
├── middleware.ts
└── package.json
```

## 🎨 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **Styling**: TailwindCSS 4
- **Icons**: Lucide React
- **Date Formatting**: date-fns
- **Language**: TypeScript

## 🔧 Configuration

### MongoDB Indexes

The application automatically creates indexes for optimal query performance:

- Logs: `createdAt`, `level`, `source`, `apiKeyId`
- API Keys: `key` (unique)
- Users: `email` (unique)

### Rate Limiter Configuration

You can customize rate limits in `lib/rate-limiter.ts`:

```typescript
export const logRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 1000, // Adjust as needed
});
```

## 📊 Dashboard Features

### Logs Page
- Real-time log viewing with pagination
- Filter by level (info, warn, error, debug)
- Filter by source application
- Search log messages
- View detailed metadata
- Responsive table design

### Statistics Page
- Total log count
- Logs by level breakdown
- Top 10 log sources
- Logs over time visualization
- Customizable time ranges (1h, 6h, 24h, 7d, 30d)

### API Keys Page
- Create new API keys
- View all API keys
- Copy API keys to clipboard
- Toggle active/inactive status
- Delete API keys
- View last used timestamp

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS
- Google Cloud
- Azure

Make sure to:
1. Set all environment variables
2. Ensure MongoDB is accessible from your deployment
3. Update `NEXTAUTH_URL` to your production URL

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 🐛 Troubleshooting

### MongoDB Connection Issues

If you can't connect to MongoDB:
- Verify `MONGODB_URI` is correct (`mongodb://localhost:27017/ux-monitoring`)
- Check if MongoDB is running: `brew services list` (macOS) or `sudo systemctl status mongod` (Linux)
- Test connection manually: `mongosh mongodb://localhost:27017`
- Restart MongoDB: `brew services restart mongodb-community`
- Check MongoDB logs for errors

### Authentication Issues

If login doesn't work:
- Clear browser cookies
- Verify `JWT_SECRET` is set
- Check browser console for errors

### Rate Limiting Issues

If you're getting rate limited:
- Adjust rate limits in `lib/rate-limiter.ts`
- Clear the in-memory rate limit store (restart server)
- Implement Redis for distributed rate limiting (production)

## 📧 Support

For issues and questions, please open an issue on GitHub or contact the maintainer.

## 🎉 Acknowledgments

Built with ❤️ using Next.js, MongoDB, and TailwindCSS.
