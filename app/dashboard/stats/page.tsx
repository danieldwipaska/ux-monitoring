'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, Activity, AlertCircle, Info, AlertTriangle, XCircle, Bug } from 'lucide-react';

interface Stats {
  totalLogs: number;
  levelStats: Array<{ level: string; count: number }>;
  sourceStats: Array<{ source: string; count: number }>;
  logsOverTime: Array<{ time: string; count: number }>;
}

const levelConfig = {
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' },
  warn: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  debug: { icon: Bug, color: 'text-gray-600', bg: 'bg-gray-50' },
};

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('24');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/logs/stats?hours=${timeRange}`);
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch statistics');
      }

      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
          <p className="text-gray-600 mt-1">Analytics and insights for your logs</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="1">Last 1 hour</option>
          <option value="6">Last 6 hours</option>
          <option value="24">Last 24 hours</option>
          <option value="168">Last 7 days</option>
          <option value="720">Last 30 days</option>
        </select>
      </div>

      {/* Total Logs Card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">Total Logs</p>
            <p className="text-4xl font-bold">{stats.totalLogs.toLocaleString()}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full p-4">
            <Activity className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Level Stats */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Logs by Level
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.levelStats.map((stat) => {
            const config = levelConfig[stat.level as keyof typeof levelConfig];
            const Icon = config?.icon || Info;
            const percentage = stats.totalLogs > 0 ? (stat.count / stats.totalLogs) * 100 : 0;

            return (
              <div key={stat.level} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${config?.bg || 'bg-gray-50'} rounded-lg p-2`}>
                    <Icon className={`w-6 h-6 ${config?.color || 'text-gray-600'}`} />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stat.count}</span>
                </div>
                <p className="text-gray-600 font-medium capitalize mb-2">{stat.level}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${config?.color.replace('text-', 'bg-')}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{percentage.toFixed(1)}% of total</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Source Stats */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Top Sources
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {stats.sourceStats.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No source data available</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {stats.sourceStats.map((stat, index) => {
                const percentage = stats.totalLogs > 0 ? (stat.count / stats.totalLogs) * 100 : 0;
                return (
                  <div key={stat.source} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-900">{stat.source}</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{stat.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Logs Over Time */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Logs Over Time
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {stats.logsOverTime.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No time series data available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.logsOverTime.map((stat) => {
                const maxCount = Math.max(...stats.logsOverTime.map(s => s.count));
                const width = maxCount > 0 ? (stat.count / maxCount) * 100 : 0;
                
                return (
                  <div key={stat.time} className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 w-32 flex-shrink-0">{stat.time}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-8 rounded-full transition-all flex items-center justify-end pr-3"
                        style={{ width: `${width}%` }}
                      >
                        {width > 15 && (
                          <span className="text-white font-medium text-sm">{stat.count}</span>
                        )}
                      </div>
                      {width <= 15 && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 font-medium text-sm">
                          {stat.count}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
