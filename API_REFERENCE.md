# API Reference

Dokumentasi lengkap untuk semua API endpoints yang tersedia di UX Monitoring.

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

Ada dua jenis authentication:

1. **User Authentication**: Menggunakan JWT token dalam HTTP-only cookie (untuk dashboard)
2. **API Key Authentication**: Menggunakan header `x-api-key` (untuk mengirim logs dari aplikasi)

---

## Authentication Endpoints

### Register User

Membuat akun user baru.

**Endpoint**: `POST /api/auth/register`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response Success** (201):
```json
{
  "message": "Registration successful",
  "user": {
    "id": "64abc123...",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Response Error** (400):
```json
{
  "error": "User already exists"
}
```

---

### Login

Login dan mendapatkan JWT token.

**Endpoint**: `POST /api/auth/login`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response Success** (200):
```json
{
  "message": "Login successful",
  "user": {
    "id": "64abc123...",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Response Error** (401):
```json
{
  "error": "Invalid credentials"
}
```

**Rate Limit**: 5 requests per 15 menit per IP

---

### Logout

Logout dan hapus JWT token.

**Endpoint**: `POST /api/auth/logout`

**Response Success** (200):
```json
{
  "message": "Logout successful"
}
```

---

### Get Current User

Mendapatkan informasi user yang sedang login.

**Endpoint**: `GET /api/auth/me`

**Headers**:
```
Cookie: auth-token=<jwt-token>
```

**Response Success** (200):
```json
{
  "user": {
    "id": "64abc123...",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response Error** (401):
```json
{
  "error": "Unauthorized"
}
```

---

## API Key Endpoints

### Get All API Keys

Mendapatkan semua API keys milik user.

**Endpoint**: `GET /api/api-keys`

**Headers**:
```
Cookie: auth-token=<jwt-token>
```

**Response Success** (200):
```json
{
  "apiKeys": [
    {
      "_id": "64abc123...",
      "name": "My React App",
      "key": "lm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "isActive": true,
      "lastUsed": "2024-01-01T12:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

---

### Create API Key

Membuat API key baru.

**Endpoint**: `POST /api/api-keys`

**Headers**:
```
Cookie: auth-token=<jwt-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "My React App"
}
```

**Response Success** (201):
```json
{
  "message": "API key created successfully",
  "apiKey": {
    "id": "64abc123...",
    "name": "My React App",
    "key": "lm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**⚠️ PENTING**: Simpan API key ini! Anda tidak akan bisa melihatnya lagi.

---

### Delete API Key

Menghapus API key.

**Endpoint**: `DELETE /api/api-keys/:id`

**Headers**:
```
Cookie: auth-token=<jwt-token>
```

**Response Success** (200):
```json
{
  "message": "API key deleted successfully"
}
```

**Response Error** (404):
```json
{
  "error": "API key not found"
}
```

---

### Toggle API Key Status

Mengaktifkan atau menonaktifkan API key.

**Endpoint**: `PATCH /api/api-keys/:id`

**Headers**:
```
Cookie: auth-token=<jwt-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "isActive": false
}
```

**Response Success** (200):
```json
{
  "message": "API key updated successfully",
  "apiKey": {
    "id": "64abc123...",
    "name": "My React App",
    "isActive": false
  }
}
```

---

## Logs Endpoints

### Create Log

Mengirim log dari aplikasi (memerlukan API key).

**Endpoint**: `POST /api/logs`

**Headers**:
```
Content-Type: application/json
x-api-key: lm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Request Body**:
```json
{
  "level": "info",
  "message": "User logged in successfully",
  "source": "my-react-app",
  "metadata": {
    "userId": "123",
    "action": "login",
    "timestamp": "2024-01-01T12:00:00.000Z"
  },
  "userId": "optional-user-id"
}
```

**Fields**:
- `level` (required): `"info"` | `"warn"` | `"error"` | `"debug"`
- `message` (required): String - Pesan log
- `source` (required): String - Nama aplikasi sumber
- `metadata` (optional): Object - Data tambahan
- `userId` (optional): String - ID user terkait

**Response Success** (201):
```json
{
  "message": "Log created successfully",
  "logId": "64abc123..."
}
```

**Response Error** (401):
```json
{
  "error": "Invalid or missing API key"
}
```

**Response Error** (429):
```json
{
  "error": "Rate limit exceeded"
}
```

**Rate Limit**: 1000 requests per menit per API key

---

### Get Logs

Mendapatkan logs dengan filtering dan pagination (untuk dashboard).

**Endpoint**: `GET /api/logs`

**Headers**:
```
Cookie: auth-token=<jwt-token>
```

**Query Parameters**:
- `page` (optional): Number - Halaman (default: 1)
- `limit` (optional): Number - Jumlah per halaman (default: 50)
- `level` (optional): String - Filter by level (`info`, `warn`, `error`, `debug`)
- `source` (optional): String - Filter by source
- `search` (optional): String - Search dalam message

**Example**:
```
GET /api/logs?page=1&limit=50&level=error&source=my-app&search=failed
```

**Response Success** (200):
```json
{
  "logs": [
    {
      "_id": "64abc123...",
      "level": "error",
      "message": "Payment failed",
      "source": "my-react-app",
      "metadata": {
        "userId": "123",
        "amount": 100
      },
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "apiKeyId": {
        "name": "My React App"
      },
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1000,
    "pages": 20
  }
}
```

---

### Get Log Statistics

Mendapatkan statistik logs.

**Endpoint**: `GET /api/logs/stats`

**Headers**:
```
Cookie: auth-token=<jwt-token>
```

**Query Parameters**:
- `hours` (optional): Number - Rentang waktu dalam jam (default: 24)

**Example**:
```
GET /api/logs/stats?hours=24
```

**Response Success** (200):
```json
{
  "totalLogs": 1500,
  "levelStats": [
    {
      "level": "info",
      "count": 1000
    },
    {
      "level": "error",
      "count": 300
    },
    {
      "level": "warn",
      "count": 150
    },
    {
      "level": "debug",
      "count": 50
    }
  ],
  "sourceStats": [
    {
      "source": "my-react-app",
      "count": 800
    },
    {
      "source": "my-other-app",
      "count": 700
    }
  ],
  "logsOverTime": [
    {
      "time": "2024-01-01 00:00",
      "count": 50
    },
    {
      "time": "2024-01-01 01:00",
      "count": 75
    }
  ]
}
```

---

## Error Responses

Semua error responses mengikuti format:

```json
{
  "error": "Error message here"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid credentials atau missing auth)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Rate Limiting

### Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/login` | 5 requests | 15 minutes |
| `/api/logs` (POST) | 1000 requests | 1 minute |
| Other endpoints | 100 requests | 1 minute |

### Rate Limit Headers

Saat rate limit aktif, response akan include:

```json
{
  "error": "Rate limit exceeded"
}
```

Status code: `429 Too Many Requests`

---

## Examples

### cURL Examples

#### Create Log
```bash
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -H "x-api-key: lm_your_api_key" \
  -d '{
    "level": "info",
    "message": "Test log",
    "source": "test-app",
    "metadata": {"test": true}
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

#### Get Logs (with auth)
```bash
curl -X GET "http://localhost:3000/api/logs?page=1&limit=10" \
  -b cookies.txt
```

### JavaScript/Axios Examples

#### Create Log
```javascript
import axios from 'axios';

const response = await axios.post(
  'http://localhost:3000/api/logs',
  {
    level: 'info',
    message: 'User action',
    source: 'my-app',
    metadata: { userId: '123' }
  },
  {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'lm_your_api_key'
    }
  }
);
```

#### Login
```javascript
const response = await axios.post(
  'http://localhost:3000/api/auth/login',
  {
    email: 'user@example.com',
    password: 'password123'
  },
  {
    withCredentials: true
  }
);
```

---

## Best Practices

1. **API Keys**: 
   - Simpan API key dengan aman
   - Jangan commit API key ke Git
   - Gunakan environment variables
   - Rotate API key secara berkala

2. **Rate Limiting**:
   - Implement retry logic dengan exponential backoff
   - Batch logs jika memungkinkan
   - Monitor rate limit usage

3. **Error Handling**:
   - Selalu handle error responses
   - Log error ke console untuk debugging
   - Implement fallback mechanism

4. **Security**:
   - Gunakan HTTPS di production
   - Validate input sebelum mengirim
   - Jangan log sensitive data

5. **Performance**:
   - Kirim logs asynchronously
   - Jangan block UI saat mengirim logs
   - Consider debouncing untuk high-frequency events

---

## Support

Untuk pertanyaan atau masalah:
- Baca dokumentasi lengkap di README.md
- Check troubleshooting guide di SETUP_GUIDE.md
- Buka issue di GitHub

---

**Last Updated**: December 2024
