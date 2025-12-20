# Quick Start Guide - UX Monitoring

Panduan cepat untuk menjalankan aplikasi dalam 5 menit!

## 🚀 Langkah Cepat

### 1. Install Dependencies (1 menit)

```bash
npm install
```

### 2. Setup MongoDB Local (2 menit)

**Install MongoDB di macOS:**

```bash
# Install MongoDB menggunakan Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Jalankan MongoDB sebagai service
brew services start mongodb-community

# Atau jalankan manual
mongod --config /opt/homebrew/etc/mongod.conf
```

**Verifikasi MongoDB berjalan:**

```bash
# Test koneksi
mongosh

# Jika berhasil, Anda akan masuk ke MongoDB shell
# Ketik 'exit' untuk keluar
```

MongoDB akan berjalan di `mongodb://localhost:27017`

### 3. Setup Environment Variables (30 detik)

Buat file `.env.local` di root folder:

```bash
# MongoDB Local
MONGODB_URI=mongodb://localhost:27017/ux-monitoring

# Generate secret key (copy hasil command di bawah)
JWT_SECRET=paste-hasil-generate-disini

# Optional
NEXTAUTH_SECRET=paste-hasil-generate-disini
NEXTAUTH_URL=http://localhost:3000
```

**Generate secret keys:**

```bash
# Run ini 2x untuk JWT_SECRET dan NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Jalankan Aplikasi (30 detik)

```bash
npm run dev
```

Buka browser: [http://localhost:3000](http://localhost:3000)

### 5. Setup Akun & API Key (1 menit)

1. Klik tab **"Register"**
2. Isi:
   - Name: `Your Name`
   - Email: `your@email.com`
   - Password: `password123` (min 6 karakter)
3. Klik **"Create Account"**
4. Anda akan masuk ke dashboard
5. Klik menu **"API Keys"**
6. Klik **"Create API Key"**
7. Nama: `My React App`
8. Klik **"Create"**
9. **COPY API KEY** yang muncul! (contoh: `lm_abc123...`)

## ✅ Selesai!

Aplikasi Anda sudah berjalan! Sekarang test dengan mengirim log:

### Test dengan cURL

```bash
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -H "x-api-key: PASTE_API_KEY_ANDA_DISINI" \
  -d '{
    "level": "info",
    "message": "Test log pertama saya!",
    "source": "test-app",
    "metadata": {
      "test": true,
      "timestamp": "2024-01-01T12:00:00Z"
    }
  }'
```

Jika berhasil, Anda akan melihat:
```json
{
  "message": "Log created successfully",
  "logId": "..."
}
```

Refresh dashboard Anda, log akan muncul! 🎉

## 📱 Integrasi dengan React App

### 1. Copy Logger ke Project React Anda

```bash
# Dari folder ux-monitoring
cp examples/react-logger.js /path/to/your/react-app/src/utils/
```

### 2. Edit Konfigurasi

Buka `src/utils/react-logger.js` dan update:

```javascript
const API_URL = 'http://localhost:3000/api/logs';
const API_KEY = 'lm_your_api_key_here'; // Paste API key Anda
const APP_NAME = 'my-react-app'; // Nama app Anda
```

### 3. Gunakan di Component

```javascript
import { logger } from './utils/react-logger';

function App() {
  useEffect(() => {
    logger.info('App started');
  }, []);

  const handleClick = () => {
    logger.info('Button clicked', { buttonId: 'submit' });
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### 4. Lihat Logs di Dashboard

Buka [http://localhost:3000/dashboard](http://localhost:3000/dashboard) dan lihat logs Anda!

## 🎯 Fitur yang Bisa Anda Gunakan

### Dashboard Logs
- ✅ Filter by level (info, warn, error, debug)
- ✅ Filter by source (nama aplikasi)
- ✅ Search dalam messages
- ✅ Pagination
- ✅ View metadata detail

### Statistics
- ✅ Total logs
- ✅ Breakdown by level
- ✅ Top 10 sources
- ✅ Logs over time chart
- ✅ Time range filter (1h, 6h, 24h, 7d, 30d)

### API Keys
- ✅ Create unlimited API keys
- ✅ Toggle active/inactive
- ✅ Delete keys
- ✅ Track last used
- ✅ Copy to clipboard

## 🐛 Troubleshooting Cepat

### "Cannot connect to MongoDB"
- Cek `MONGODB_URI` di `.env.local`
- Pastikan password benar (tanpa `<>`)
- Cek IP whitelist di MongoDB Atlas

### "Invalid API key"
- Pastikan API key di-copy dengan benar (termasuk `lm_`)
- Cek apakah API key masih active di dashboard
- Pastikan header `x-api-key` dikirim

### Tidak bisa login
- Clear browser cookies
- Cek browser console untuk error
- Restart development server

### Logs tidak muncul
- Cek Network tab di DevTools
- Pastikan request berhasil (status 201)
- Refresh dashboard
- Cek filter yang aktif

## 📚 Dokumentasi Lengkap

- **README.md** - Overview dan fitur lengkap
- **SETUP_GUIDE.md** - Setup detail dengan troubleshooting
- **API_REFERENCE.md** - Dokumentasi API endpoints
- **examples/INTEGRATION_GUIDE.md** - Panduan integrasi lengkap

## 💡 Tips

1. **Development**: Gunakan MongoDB Atlas free tier
2. **Production**: Upgrade ke paid tier untuk performa lebih baik
3. **Security**: Ganti JWT_SECRET dengan yang kuat di production
4. **Backup**: Enable automated backup di MongoDB Atlas
5. **Monitoring**: Check logs secara berkala untuk detect issues

## 🎉 Next Steps

1. ✅ Aplikasi sudah berjalan
2. ✅ Akun sudah dibuat
3. ✅ API key sudah dibuat
4. 📝 Integrasikan dengan React app Anda
5. 📊 Monitor logs di dashboard
6. 🚀 Deploy ke production (Vercel, Netlify, dll)

---

**Selamat! Aplikasi UX Monitoring Anda sudah siap digunakan! 🚀**

Jika ada pertanyaan, buka issue di GitHub atau hubungi maintainer.

Happy Monitoring! ✨
