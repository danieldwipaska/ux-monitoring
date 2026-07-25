import Link from 'next/link';
import { Activity, Globe, MessageSquare, ExternalLink, Code } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                UX Monitoring
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              An open-source log management & real-time monitoring platform for React & Next.js applications.
              Collect, filter, and analyze error logs securely and efficiently.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <Code className="w-4 h-4 text-blue-400" />
              <span>MIT Open Source License &bull; Fullstack Next.js 16 & MongoDB</span>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Key Features
                </a>
              </li>
              <li>
                <a href="#guide" className="hover:text-white transition-colors">
                  Getting Started
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact & Support
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard Platform
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 tracking-wider uppercase">
              Developer Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://wa.me/6285172160300"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  WhatsApp Direct
                </a>
              </li>
              <li>
                <a
                  href="https://webshake.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Globe className="w-4 h-4 text-blue-400" />
                  Business (webshake.id)
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://danielkamasi.my.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Globe className="w-4 h-4 text-purple-400" />
                  Personal Site
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} UX Monitoring. Open Source Software.</p>
          <p className="text-slate-400">
            Built for modern application monitoring and reliability.
          </p>
        </div>
      </div>
    </footer>
  );
}
