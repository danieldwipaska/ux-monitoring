'use client';

import { useState } from 'react';
import Link from 'next/link';
import LandingNavbar from '@/components/LandingNavbar';
import LandingFooter from '@/components/LandingFooter';
import {
  Activity,
  BarChart3,
  Key,
  ShieldCheck,
  Terminal,
  Cpu,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  Globe,
  MessageSquare,
  BookOpen,
  Layers,
  Lock,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const envSnippet = `# .env.local
MONGODB_URI=mongodb://localhost:27017/ux-monitoring
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000`;

  const installSnippet = `# Clone repository
git clone https://github.com/danieldwipaska/ux-monitoring.git
cd ux-monitoring

# Install dependencies & start dev server
npm install
npm run dev`;

  const reactLoggerSnippet = `// logger.js - React / Next.js Integration Utility
import axios from 'axios';

const API_URL = "http://localhost:3000/api";
const API_KEY = "lm_your_api_key_here";

let accessToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiresAt) return accessToken;
  try {
    const res = await axios.post(\`\${API_URL}/auth/token\`, {}, {
      headers: { "x-api-key": API_KEY }
    });
    accessToken = res.data.accessToken;
    tokenExpiresAt = Date.now() + (res.data.expiresIn - 60) * 1000;
    return accessToken;
  } catch (err) {
    console.error("Failed to fetch UX Monitoring access token");
    return null;
  }
}

export const logger = {
  info: (msg, meta = {}) => sendLog("info", msg, meta),
  warn: (msg, meta = {}) => sendLog("warn", msg, meta),
  error: (msg, meta = {}) => sendLog("error", msg, meta),
};

async function sendLog(level, message, metadata) {
  const token = await getAccessToken();
  if (!token) return;
  await axios.post(\`\${API_URL}/logs\`, 
    { level, message, source: "my-react-app", metadata },
    { headers: { Authorization: \`Bearer \${token}\` } }
  );
}`;

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      {/* Top Navbar */}
      <LandingNavbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-slate-50 border-b border-gray-200 py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Heading & CTAs */}
              <div className="lg:col-span-7 space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  Centralized & Real-Time Log & Error Monitoring for React Apps
                </h1>

                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                  UX Monitoring is an open-source log management platform engineered to collect, 
                  analyze, and monitor your web application health in real-time with speed and isolated security.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <Link
                    href="/dashboard"
                    className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    Open Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  <a
                    href="#guide"
                    className="px-6 py-3.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-5 h-5 text-gray-500" />
                    Getting Started
                  </a>
                </div>

                {/* Key Highlights */}
                <div className="pt-6 border-t border-gray-200 grid grid-cols-3 gap-4 text-left">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">100%</div>
                    <div className="text-xs text-gray-500 font-medium">Open Source & Free</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">JWT & API Key</div>
                    <div className="text-xs text-gray-500 font-medium">Isolated Data Scope</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">&lt; 50ms</div>
                    <div className="text-xs text-gray-500 font-medium">Fast Log Ingestion</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Code/UI Dashboard Preview Box */}
              <div className="lg:col-span-5">
                <div className="bg-slate-900 rounded-xl shadow-xl border border-slate-800 p-6 text-slate-100 font-mono text-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs text-slate-400">ux-monitoring-live-feed</span>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400">[INFO]</span>
                      <span className="text-slate-300">Application initialized successfully</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400">[DEBUG]</span>
                      <span className="text-slate-300">Connected to MongoDB cluster</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-400">[WARN]</span>
                      <span className="text-slate-300">API rate limit threshold: 85% capacity</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">[ERROR]</span>
                      <span className="text-slate-200">Unhandled Promise: Failed to fetch user session</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>Status: System Operational</span>
                    </div>
                    <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded">API Version 1.0</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* KEY FEATURES SECTION */}
        <section id="features" className="py-20 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Key Features of UX Monitoring
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Everything you need to monitor logs and frontend application performance, delivered in one integrated dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-xs hover:border-blue-500 transition-colors">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Real-Time Log & Exception Tracking
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Collect info, warn, error, and debug logs from your React apps automatically with deep search and level filtering.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-xs hover:border-blue-500 transition-colors">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                  <Key className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  API Key Management & Data Isolation
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Generate and manage API keys for each app. Logs are stored securely and strictly isolated per user account.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-xs hover:border-blue-500 transition-colors">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Visual Analytics & Interactive Charts
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Analyze daily log trends, error distribution by app, and top log sources via interactive Recharts data visualizations.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-xs hover:border-blue-500 transition-colors">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Lightweight SDK Integration
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Integrate a simple logger helper into React or Next.js applications without inflating client bundle size.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-xs hover:border-blue-500 transition-colors">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Rate Limiting & JWT Protection
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Built-in rate limiting protection on API endpoints alongside JWT-based authentication and HTTP-only cookies.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-xs hover:border-blue-500 transition-colors">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Flexible Open-Source Architecture
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Deploy self-hosted on your own infrastructure using MongoDB and Next.js 16 with zero vendor lock-in.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* OPEN-SOURCE GUIDE SECTION */}
        <section id="guide" className="py-20 bg-slate-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Getting Started & Open-Source Guide
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Quick step-by-step instructions to run UX Monitoring locally and connect it to your React applications.
              </p>
            </div>

            <div className="space-y-12">
              {/* Step 1 */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-600 text-white font-bold rounded-lg flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      Clone Repository & Launch Local Server
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Download the source code from GitHub, install Node.js dependencies, and run the development server.
                    </p>
                    <div className="relative bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-xs sm:text-sm overflow-x-auto">
                      <button
                        onClick={() => copyToClipboard(installSnippet, 1)}
                        className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors flex items-center gap-1 text-xs"
                      >
                        {copiedIndex === 1 ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedIndex === 1 ? 'Copied' : 'Copy'}</span>
                      </button>
                      <pre>{installSnippet}</pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-600 text-white font-bold rounded-lg flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      Configure Environment Variables (<code className="font-mono text-blue-600 bg-blue-50 px-1 py-0.5 rounded text-base">.env.local</code>)
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Create a <code className="bg-gray-100 text-blue-600 px-1.5 py-0.5 rounded font-mono">.env.local</code> file in the project root directory and set up your MongoDB connection and JWT secret keys.
                    </p>
                    <div className="relative bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-xs sm:text-sm overflow-x-auto">
                      <button
                        onClick={() => copyToClipboard(envSnippet, 2)}
                        className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors flex items-center gap-1 text-xs"
                      >
                        {copiedIndex === 2 ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedIndex === 2 ? 'Copied' : 'Copy'}</span>
                      </button>
                      <pre>{envSnippet}</pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-600 text-white font-bold rounded-lg flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      Register Account & Generate API Key
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Open <code className="bg-gray-100 text-blue-600 px-1.5 py-0.5 rounded font-mono">http://localhost:3000</code> in your browser, 
                      register a new account, then navigate to <strong>API Keys</strong> in the Dashboard to create a unique API key (prefixed with <code className="bg-gray-100 text-blue-600 px-1.5 py-0.5 rounded font-mono">lm_</code>).
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-600 text-white font-bold rounded-lg flex items-center justify-center flex-shrink-0">
                    4
                  </div>
                  <div className="flex-1 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      Integrate Logger Helper into Your Client App
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Use the following lightweight utility in your React / Next.js project to automatically transmit logs to the UX Monitoring server.
                    </p>
                    <div className="relative bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-xs sm:text-sm overflow-x-auto">
                      <button
                        onClick={() => copyToClipboard(reactLoggerSnippet, 4)}
                        className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors flex items-center gap-1 text-xs"
                      >
                        {copiedIndex === 4 ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedIndex === 4 ? 'Copied' : 'Copy'}</span>
                      </button>
                      <pre>{reactLoggerSnippet}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION (CTA) SECTION */}
        <section id="contact" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-900 rounded-2xl p-8 sm:p-12 text-white shadow-xl">
              <div className="max-w-3xl space-y-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Interested in Custom Features or Collaboration?
                </h2>
                <p className="text-slate-300 text-lg leading-relaxed">
                  This open-source project is built with dedication for the developer community. If you need custom integrations, 
                  enterprise feature support, or web development consultation, feel free to reach out to us directly.
                </p>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* WhatsApp CTA */}
                  <a
                    href="https://wa.me/6285172160300"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-5 bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors text-white font-medium flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <MessageSquare className="w-6 h-6 text-emerald-200" />
                      <ExternalLink className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div>
                      <div className="text-xs text-emerald-200 font-semibold uppercase tracking-wider">WhatsApp Direct</div>
                      <div className="text-sm font-bold mt-0.5">+62 851-7216-0300</div>
                    </div>
                  </a>

                  {/* Business Web CTA */}
                  <a
                    href="https://webshake.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-5 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors text-white font-medium flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <Globe className="w-6 h-6 text-blue-200" />
                      <ExternalLink className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div>
                      <div className="text-xs text-blue-200 font-semibold uppercase tracking-wider">Business Website</div>
                      <div className="text-sm font-bold mt-0.5">webshake.id</div>
                    </div>
                  </a>

                  {/* Personal Web CTA */}
                  <a
                    href="https://danielkamasi.my.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors text-white font-medium flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <Globe className="w-6 h-6 text-slate-300" />
                      <ExternalLink className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Personal Website</div>
                      <div className="text-sm font-bold mt-0.5">danielkamasi.my.id</div>
                    </div>
                  </a>
                </div>

                <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-slate-400">
                    Ready to start monitoring your application logs today?
                  </div>
                  <Link
                    href="/login"
                    className="px-6 py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2"
                  >
                    Get Started - Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
