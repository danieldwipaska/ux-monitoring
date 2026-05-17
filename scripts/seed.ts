/**
 * Seed script for UX Monitoring — Development Only
 * 
 * Generates realistic log data for testing the statistics page.
 * 
 * Usage:
 *   npx tsx scripts/seed.ts
 * 
 * Options:
 *   --clean    Clear all existing logs before seeding
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ux-monitoring';

// ─── Schema Definitions (inline to avoid path alias issues) ─────────────

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const ApiKeySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    lastUsed: { type: Date },
  },
  { timestamps: true }
);

const LogSchema = new mongoose.Schema(
  {
    level: { type: String, enum: ['info', 'warn', 'error', 'debug'], required: true, index: true },
    event: { type: String, required: true, index: true },
    source: { type: String, required: true, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
    userAgent: { type: String },
    ip: { type: String },
    user: { type: mongoose.Schema.Types.Mixed },
    apiKeyId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiKey', required: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    timestamp: { type: Date, required: true, index: true, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const ApiKey = mongoose.models.ApiKey || mongoose.model('ApiKey', ApiKeySchema);
const Log = mongoose.models.Log || mongoose.model('Log', LogSchema);

// ─── Seed Data Configuration ───────────────────────────────────────────

const SOURCES = [
  'whatsapp-bot',
  'api-gateway',
  'payment-service',
  'auth-service',
  'notification-service',
];

interface EventTemplate {
  event: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  weight: number; // higher = more frequent
  metadataFn: () => Record<string, any>;
}

const EVENT_TEMPLATES: Record<string, EventTemplate[]> = {
  'whatsapp-bot': [
    { event: 'message.received', level: 'info', weight: 30, metadataFn: () => ({ chatId: `628${randomDigits(10)}@c.us`, type: pick(['text', 'image', 'document']), message: pick(['Halo', 'Mau pesan', 'Info produk', 'Terima kasih']) }) },
    { event: 'message.sent', level: 'info', weight: 25, metadataFn: () => ({ chatId: `628${randomDigits(10)}@c.us`, type: 'text', responseTime: randomInt(100, 2000) }) },
    { event: 'media.download', level: 'info', weight: 10, metadataFn: () => ({ fileSize: randomInt(1000, 5000000), mimeType: pick(['image/jpeg', 'application/pdf', 'image/png']) }) },
    { event: 'media.download.failed', level: 'error', weight: 3, metadataFn: () => ({ error: pick(['TIMEOUT', 'FILE_TOO_LARGE', 'NETWORK_ERROR']), retries: randomInt(0, 3) }) },
    { event: 'session.reconnect', level: 'warn', weight: 4, metadataFn: () => ({ reason: pick(['CONNECTION_LOST', 'TIMEOUT', 'SERVER_RESTART']), attempt: randomInt(1, 5) }) },
    { event: 'session.authenticated', level: 'info', weight: 2, metadataFn: () => ({ method: 'qr_code' }) },
    { event: 'queue.process', level: 'debug', weight: 8, metadataFn: () => ({ queueLength: randomInt(0, 50), processingTime: randomInt(10, 500) }) },
    { event: 'queue.overflow', level: 'error', weight: 1, metadataFn: () => ({ queueLength: randomInt(100, 500), maxCapacity: 100 }) },
  ],
  'api-gateway': [
    { event: 'request.incoming', level: 'info', weight: 40, metadataFn: () => ({ method: pick(['GET', 'POST', 'PUT', 'DELETE']), path: pick(['/api/products', '/api/orders', '/api/users', '/api/reports']), statusCode: pick([200, 200, 200, 201, 204]), responseTime: randomInt(10, 300) }) },
    { event: 'request.slow', level: 'warn', weight: 5, metadataFn: () => ({ method: 'GET', path: pick(['/api/reports/monthly', '/api/analytics']), responseTime: randomInt(3000, 10000) }) },
    { event: 'request.failed', level: 'error', weight: 3, metadataFn: () => ({ method: pick(['POST', 'PUT']), path: pick(['/api/orders', '/api/payments']), statusCode: pick([500, 502, 503]), error: pick(['Internal Server Error', 'Bad Gateway', 'Service Unavailable']) }) },
    { event: 'rate.limit.exceeded', level: 'warn', weight: 2, metadataFn: () => ({ ip: `192.168.1.${randomInt(1, 254)}`, endpoint: pick(['/api/auth/login', '/api/products']), limit: 100 }) },
    { event: 'cors.rejected', level: 'warn', weight: 1, metadataFn: () => ({ origin: pick(['http://malicious-site.com', 'http://unknown-origin.xyz']), method: 'POST' }) },
    { event: 'cache.hit', level: 'debug', weight: 15, metadataFn: () => ({ key: pick(['products:all', 'user:profile', 'config:app']), ttl: randomInt(60, 3600) }) },
    { event: 'cache.miss', level: 'debug', weight: 8, metadataFn: () => ({ key: pick(['products:search', 'orders:recent']), fetchTime: randomInt(50, 500) }) },
  ],
  'payment-service': [
    { event: 'payment.initiated', level: 'info', weight: 15, metadataFn: () => ({ orderId: `ORD-${randomDigits(8)}`, amount: randomInt(10000, 5000000), method: pick(['bank_transfer', 'ewallet', 'credit_card', 'qris']) }) },
    { event: 'payment.success', level: 'info', weight: 12, metadataFn: () => ({ orderId: `ORD-${randomDigits(8)}`, amount: randomInt(10000, 5000000), method: pick(['bank_transfer', 'ewallet', 'qris']), processingTime: randomInt(500, 5000) }) },
    { event: 'payment.failed', level: 'error', weight: 3, metadataFn: () => ({ orderId: `ORD-${randomDigits(8)}`, amount: randomInt(10000, 5000000), reason: pick(['INSUFFICIENT_FUNDS', 'EXPIRED', 'DECLINED', 'NETWORK_ERROR']), gateway: pick(['midtrans', 'xendit']) }) },
    { event: 'payment.refund', level: 'info', weight: 2, metadataFn: () => ({ orderId: `ORD-${randomDigits(8)}`, amount: randomInt(10000, 500000), reason: pick(['CUSTOMER_REQUEST', 'DUPLICATE', 'PRODUCT_ISSUE']) }) },
    { event: 'webhook.received', level: 'debug', weight: 10, metadataFn: () => ({ provider: pick(['midtrans', 'xendit']), eventType: pick(['payment.success', 'payment.expire', 'payment.cancel']) }) },
    { event: 'webhook.invalid_signature', level: 'error', weight: 1, metadataFn: () => ({ provider: pick(['midtrans', 'xendit']), ip: `103.${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}` }) },
  ],
  'auth-service': [
    { event: 'user.login', level: 'info', weight: 20, metadataFn: () => ({ userId: `USR-${randomDigits(6)}`, method: pick(['password', 'google', 'phone']), ip: `192.168.${randomInt(1, 10)}.${randomInt(1, 254)}` }) },
    { event: 'user.login.failed', level: 'warn', weight: 8, metadataFn: () => ({ email: `user${randomInt(1, 100)}@example.com`, reason: pick(['INVALID_PASSWORD', 'ACCOUNT_LOCKED', 'EMAIL_NOT_FOUND']), attempts: randomInt(1, 5) }) },
    { event: 'user.register', level: 'info', weight: 5, metadataFn: () => ({ userId: `USR-${randomDigits(6)}`, method: pick(['email', 'google', 'phone']) }) },
    { event: 'token.refresh', level: 'debug', weight: 15, metadataFn: () => ({ userId: `USR-${randomDigits(6)}`, tokenAge: randomInt(300, 86400) }) },
    { event: 'token.expired', level: 'warn', weight: 6, metadataFn: () => ({ userId: `USR-${randomDigits(6)}`, expiredAt: new Date(Date.now() - randomInt(1000, 86400000)).toISOString() }) },
    { event: 'brute_force.detected', level: 'error', weight: 1, metadataFn: () => ({ ip: `103.${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}`, attempts: randomInt(10, 50), window: '5m' }) },
    { event: 'password.reset', level: 'info', weight: 2, metadataFn: () => ({ userId: `USR-${randomDigits(6)}` }) },
  ],
  'notification-service': [
    { event: 'email.sent', level: 'info', weight: 15, metadataFn: () => ({ to: `user${randomInt(1, 200)}@example.com`, template: pick(['welcome', 'order_confirmation', 'password_reset', 'promotion']), provider: 'sendgrid' }) },
    { event: 'email.failed', level: 'error', weight: 2, metadataFn: () => ({ to: `user${randomInt(1, 200)}@example.com`, error: pick(['INVALID_EMAIL', 'QUOTA_EXCEEDED', 'TEMPLATE_ERROR']), provider: 'sendgrid' }) },
    { event: 'push.sent', level: 'info', weight: 10, metadataFn: () => ({ userId: `USR-${randomDigits(6)}`, title: pick(['Pesanan Dikirim', 'Promo Baru', 'Pembayaran Berhasil']), platform: pick(['android', 'ios']) }) },
    { event: 'push.failed', level: 'warn', weight: 3, metadataFn: () => ({ userId: `USR-${randomDigits(6)}`, reason: pick(['TOKEN_EXPIRED', 'DEVICE_UNREGISTERED']), platform: pick(['android', 'ios']) }) },
    { event: 'sms.sent', level: 'info', weight: 5, metadataFn: () => ({ phone: `+628${randomDigits(10)}`, type: pick(['otp', 'notification']), provider: 'twilio' }) },
    { event: 'sms.failed', level: 'error', weight: 1, metadataFn: () => ({ phone: `+628${randomDigits(10)}`, error: pick(['INVALID_NUMBER', 'INSUFFICIENT_BALANCE']), provider: 'twilio' }) },
    { event: 'queue.processed', level: 'debug', weight: 12, metadataFn: () => ({ batchSize: randomInt(1, 50), processingTime: randomInt(100, 3000), type: pick(['email', 'push', 'sms']) }) },
  ],
};

// ─── Helper Functions ──────────────────────────────────────────────────

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDigits(len: number): string {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join('');
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick(templates: EventTemplate[]): EventTemplate {
  const totalWeight = templates.reduce((sum, t) => sum + t.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const t of templates) {
    rand -= t.weight;
    if (rand <= 0) return t;
  }
  return templates[templates.length - 1];
}

function randomDate(start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  return new Date(startTime + Math.random() * (endTime - startTime));
}

/**
 * Generate a volume multiplier based on time patterns:
 * - More logs during business hours (8-18)
 * - Fewer logs on weekends
 * - Spike patterns on random days
 */
function getVolumeMultiplier(date: Date): number {
  const hour = date.getHours();
  const dayOfWeek = date.getDay();
  
  let multiplier = 1.0;

  // Business hours boost
  if (hour >= 8 && hour <= 18) {
    multiplier *= 2.0;
  } else if (hour >= 19 && hour <= 22) {
    multiplier *= 1.3;
  } else {
    multiplier *= 0.4; // night time
  }

  // Weekend reduction
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    multiplier *= 0.6;
  }

  return multiplier;
}

// ─── Main Seed Function ────────────────────────────────────────────────

async function seed() {
  const shouldClean = process.argv.includes('--clean');

  console.log('🌱 UX Monitoring — Seed Script');
  console.log(`   Database: ${MONGODB_URI}`);
  console.log(`   Clean mode: ${shouldClean ? 'YES' : 'NO'}`);
  console.log('');

  // Connect
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Find or create a seed user
  let user = await User.findOne({ email: 'seed@example.com' });
  if (!user) {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 10);
    user = await User.create({
      email: 'seed@example.com',
      password: hashedPassword,
      name: 'Seed User',
    });
    console.log('✅ Created seed user: seed@example.com / password123');
  } else {
    console.log('✅ Using existing seed user: seed@example.com');
  }

  // Find or create a seed API key
  let apiKey = await ApiKey.findOne({ userId: user._id, name: 'seed-key' });
  if (!apiKey) {
    apiKey = await ApiKey.create({
      name: 'seed-key',
      key: `uxm_seed_${randomDigits(32)}`,
      userId: user._id,
      isActive: true,
    });
    console.log('✅ Created seed API key');
  } else {
    console.log('✅ Using existing seed API key');
  }

  // Clean existing seed logs if requested
  if (shouldClean) {
    const result = await Log.deleteMany({ ownerId: user._id });
    console.log(`🧹 Cleaned ${result.deletedCount} existing logs`);
  }

  // ─── Generate Logs ─────────────────────────────────────────────────

  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  const TOTAL_LOGS = 5000;
  const BATCH_SIZE = 500;
  const logs: any[] = [];
  let inserted = 0;

  console.log('');
  console.log(`📝 Generating ${TOTAL_LOGS.toLocaleString()} logs over the last 90 days...`);

  for (let i = 0; i < TOTAL_LOGS; i++) {
    // Generate a timestamp with realistic distribution
    const timestamp = randomDate(ninetyDaysAgo, now);
    const volumeMultiplier = getVolumeMultiplier(timestamp);

    // Skip some logs based on volume multiplier (simulate realistic traffic)
    if (Math.random() > volumeMultiplier / 2.0) {
      // Re-pick a more likely time
      timestamp.setHours(randomInt(8, 22));
    }

    const source = pick(SOURCES);
    const templates = EVENT_TEMPLATES[source];
    const template = weightedPick(templates);

    logs.push({
      level: template.level,
      event: template.event,
      source: source,
      metadata: template.metadataFn(),
      apiKeyId: apiKey._id,
      ownerId: user._id,
      timestamp,
      ip: `192.168.${randomInt(1, 10)}.${randomInt(1, 254)}`,
      userAgent: pick([
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'node-fetch/1.0',
        'axios/1.6.0',
        'WhatsApp/2.24.5.0',
      ]),
    });

    // Insert in batches
    if (logs.length >= BATCH_SIZE) {
      await Log.insertMany(logs);
      inserted += logs.length;
      process.stdout.write(`\r   Progress: ${inserted.toLocaleString()} / ${TOTAL_LOGS.toLocaleString()} (${Math.round((inserted / TOTAL_LOGS) * 100)}%)`);
      logs.length = 0;
    }
  }

  // Insert remaining
  if (logs.length > 0) {
    await Log.insertMany(logs);
    inserted += logs.length;
  }

  console.log(`\r   Progress: ${inserted.toLocaleString()} / ${TOTAL_LOGS.toLocaleString()} (100%)`);

  // ─── Summary ───────────────────────────────────────────────────────

  const totalInDb = await Log.countDocuments({ ownerId: user._id });
  const levelCounts = await Log.aggregate([
    { $match: { ownerId: user._id } },
    { $group: { _id: '$level', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  const sourceCounts = await Log.aggregate([
    { $match: { ownerId: user._id } },
    { $group: { _id: '$source', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('   📊 Seed Complete!');
  console.log('═══════════════════════════════════════');
  console.log(`   Total logs in DB: ${totalInDb.toLocaleString()}`);
  console.log('');
  console.log('   By Level:');
  for (const l of levelCounts) {
    const icon = l._id === 'info' ? 'ℹ️ ' : l._id === 'warn' ? '⚠️ ' : l._id === 'error' ? '❌' : '🐛';
    console.log(`     ${icon} ${l._id.padEnd(6)} ${l.count.toLocaleString()}`);
  }
  console.log('');
  console.log('   By Source:');
  for (const s of sourceCounts) {
    console.log(`     📦 ${s._id.padEnd(24)} ${s.count.toLocaleString()}`);
  }
  console.log('');
  console.log('   🔐 Login: seed@example.com / password123');
  console.log('   🌐 Open: http://localhost:4000/dashboard/stats');
  console.log('═══════════════════════════════════════');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
