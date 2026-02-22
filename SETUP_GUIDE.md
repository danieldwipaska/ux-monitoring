# Setup Guide - UX Monitoring

Panduan lengkap untuk menjalankan aplikasi UX Monitoring dari awal.

## 📋 Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:

- **Node.js** versi 18 atau lebih tinggi
- **MongoDB** (lokal atau cloud seperti MongoDB Atlas)
- **npm** atau **yarn**

## 🚀 Langkah-langkah Setup

### 1. Setup MongoDB Local

**Install MongoDB di macOS:**

```bash
# Install MongoDB menggunakan Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Jalankan MongoDB sebagai service (otomatis start saat boot)
brew services start mongodb-community

# Atau jalankan manual (harus dijalankan setiap kali)
mongod --config /opt/homebrew/etc/mongod.conf
```

**Verifikasi MongoDB berjalan:**

```bash
# Test koneksi dengan MongoDB shell
mongosh

# Jika berhasil, Anda akan masuk ke MongoDB shell
# Test dengan command:
show dbs

# Ketik 'exit' untuk keluar
```

**Troubleshooting:**

Jika MongoDB tidak bisa start:

```bash
# Cek status
brew services list

# Restart MongoDB
brew services restart mongodb-community

# Cek log jika ada error
tail -f /opt/homebrew/var/log/mongodb/mongo.log
```

MongoDB akan berjalan di `mongodb://localhost:27017`

**Install MongoDB di Linux/VM:**

```bash
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Cek status
sudo systemctl status mongod
```

### 2. Setup Environment Variables

Buat file `.env.local` di root directory project:

```bash
touch .env.local
```

Isi file `.env.local` dengan konfigurasi berikut:

```env
# MongoDB Local Connection
MONGODB_URI=mongodb://localhost:27017/ux-monitoring

# JWT Secret - Ganti dengan string random yang aman
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# NextAuth Configuration (opsional untuk future extensions)
NEXTAUTH_SECRET=another-secret-key-for-nextauth
NEXTAUTH_URL=http://localhost:3000
```

**⚠️ PENTING**: Ganti `JWT_SECRET` dengan string random yang aman. Anda bisa generate dengan:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

### 5. Buat Akun Pertama

1. Buka browser dan akses [http://localhost:3000](http://localhost:3000)
2. Anda akan diarahkan ke halaman login
3. Klik tab **"Register"**
4. Isi form registrasi:
   - **Name**: Nama Anda
   - **Email**: Email Anda
   - **Password**: Password (minimal 6 karakter)
5. Klik **"Create Account"**
6. Anda akan otomatis login dan diarahkan ke dashboard

### 6. Buat API Key

1. Setelah login, klik menu **"API Keys"** di navbar
2. Klik tombol **"Create API Key"**
3. Beri nama API key (contoh: "My React App")
4. Klik **"Create"**
5. **PENTING**: Copy API key yang ditampilkan! Anda tidak akan bisa melihatnya lagi
6. API key akan terlihat seperti: `lm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 7. Test API dengan Postman atau cURL

Test apakah API key bekerja dengan mengirim log:

### 7. Test API dengan Postman atau cURL

Test apakah API key bekerja dengan mengirim log. Proses ini sekarang membutuhkan 2 tahap:

**Tahap 1: Dapatkan Access Token**

```bash
curl -X POST http://localhost:3000/api/auth/token \
  -H "x-api-key: lm_your_api_key_here"
```

Anda akan mendapatkan `"accessToken": "eyJhb..."`

**Tahap 2: Kirim Log menggunakan Token**

```bash
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken_from_step_1>" \
  -d '{
    "level": "info",
    "message": "Test log from cURL",
    "source": "test-app",
    "metadata": {
      "test": true
    }
  }'
```

Jika berhasil, Anda akan melihat response:

```json
{
  "message": "Log created successfully",
  "logId": "..."
}
```

### 8. Lihat Logs di Dashboard

1. Kembali ke dashboard (menu **"Logs"**)
2. Anda akan melihat log yang baru saja dikirim
3. Coba filter berdasarkan level, source, atau search

## 🔧 Konfigurasi Tambahan

### Production Build

Untuk membuat production build:

```bash
npm run build
npm start
```

### Environment Variables untuk Production

Untuk production, pastikan menggunakan:

```env
# Untuk production di VM/server dengan MongoDB local
MONGODB_URI=mongodb://localhost:27017/ux-monitoring

# Atau jika MongoDB di server terpisah
# MONGODB_URI=mongodb://your-mongodb-server-ip:27017/ux-monitoring

JWT_SECRET=production-secret-key-very-long-and-secure
NEXTAUTH_SECRET=production-nextauth-secret
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

### CORS Configuration (Jika diperlukan)

Jika aplikasi React Anda berjalan di domain berbeda, tambahkan konfigurasi CORS di `next.config.ts`:

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
          { key: "Access-Control-Allow-Methods", value: "POST, OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, x-api-key, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

## 📱 Integrasi dengan React App

Setelah setup selesai, ikuti langkah berikut untuk mengintegrasikan dengan aplikasi React Anda:

1. Copy file `examples/react-logger.js` ke project React Anda
2. Update konfigurasi:
   - `API_URL`: URL aplikasi monitoring Anda
   - `API_KEY`: API key yang sudah dibuat
   - `APP_NAME`: Nama aplikasi React Anda
3. Import dan gunakan logger di komponen Anda

Lihat `examples/INTEGRATION_GUIDE.md` untuk panduan lengkap.

## 🐛 Troubleshooting

### Error: "Cannot connect to MongoDB"

**Solusi**:

- Pastikan MongoDB berjalan: `brew services list` atau `sudo systemctl status mongod`
- Cek `MONGODB_URI` di `.env.local` (harus `mongodb://localhost:27017/ux-monitoring`)
- Test koneksi manual: `mongosh mongodb://localhost:27017`
- Restart MongoDB: `brew services restart mongodb-community`
- Cek log MongoDB: `tail -f /opt/homebrew/var/log/mongodb/mongo.log`

### Error: "JWT_SECRET is not defined"

**Solusi**:

- Pastikan file `.env.local` ada di root directory
- Pastikan `JWT_SECRET` sudah diisi
- Restart development server setelah menambah environment variables

### Tidak bisa login setelah registrasi

**Solusi**:

- Clear browser cookies
- Cek browser console untuk error
- Pastikan MongoDB connection berhasil
- Cek Network tab di DevTools

### API Key tidak bekerja

**Solusi**:

- Pastikan API key di-copy dengan benar (termasuk prefix `lm_`)
- Cek apakah API key masih active di dashboard
- Pastikan header `x-api-key` dikirim dengan benar
- Cek rate limiting (max 1000 requests/minute per API key)

### Logs tidak muncul di dashboard

**Solusi**:

- Cek apakah request berhasil dikirim (Network tab)
- Pastikan API key valid
- Refresh halaman dashboard
- Cek filter yang aktif (mungkin log ter-filter)

## 📊 Monitoring Performance

### Database Indexes

Aplikasi otomatis membuat indexes untuk performa optimal. Untuk melihat indexes:

```javascript
// Di MongoDB shell atau Compass
db.logs.getIndexes();
db.apikeys.getIndexes();
db.users.getIndexes();
```

### Rate Limiting

Default rate limits:

- **Login**: 5 requests per 15 menit per IP
- **Logs**: 1000 requests per menit per API key
- **General API**: 100 requests per menit per IP

Untuk mengubah, edit `lib/rate-limiter.ts`

## 🔒 Security Checklist

Sebelum deploy ke production:

- [ ] Ganti `JWT_SECRET` dengan string random yang kuat
- [ ] Ganti `NEXTAUTH_SECRET` dengan string random yang kuat
- [ ] Gunakan HTTPS untuk production
- [ ] Whitelist IP address di MongoDB Atlas
- [ ] Set `NODE_ENV=production`
- [ ] Enable CORS hanya untuk domain yang diperlukan
- [ ] Backup database secara berkala
- [ ] Monitor rate limiting dan sesuaikan jika perlu

## 📚 Referensi

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 💡 Tips

1. **Development**: Gunakan MongoDB lokal untuk development
2. **Production**: Gunakan MongoDB Atlas untuk production
3. **Backup**: Setup automated backup di MongoDB Atlas
4. **Monitoring**: Monitor database size dan performance
5. **Logs Retention**: Implement log rotation/deletion untuk logs lama
6. **Testing**: Test API endpoints dengan Postman sebelum integrasi

## 🎉 Selesai!

Aplikasi UX Monitoring Anda sekarang sudah siap digunakan. Mulai kirim logs dari aplikasi React Anda dan monitor semuanya dalam satu dashboard yang indah!

Jika ada pertanyaan atau masalah, silakan buka issue di GitHub atau hubungi maintainer.

Happy Monitoring! 🚀
