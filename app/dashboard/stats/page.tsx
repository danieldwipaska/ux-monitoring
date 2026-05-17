'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  RefreshCw, 
  Info, 
  AlertTriangle, 
  XCircle, 
  Bug,
  ChevronDown,
  Activity,
  TrendingUp,
  Zap,
  Server,
  Clock,
  Hash
} from 'lucide-react';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

interface LogData {
  date: string;
  logs: Array<{
    level: string;
    count: number;
  }>;
  total: number;
}

interface SummaryStats {
  totalLogs: number;
  logsToday: number;
  logsThisWeek: number;
  levelBreakdown: Record<string, number>;
  errorRate24h: number;
  last24hTotal: number;
  last24hErrors: number;
  topEvents: Array<{ event: string; count: number; lastSeen: string }>;
  topSources: Array<{ source: string; count: number; lastSeen: string; errorCount: number; warnCount: number }>;
}

interface StatsResponse {
  daily: LogData[];
  monthly: LogData[];
  summary: SummaryStats;
  sources: string[];
  timeRange: {
    daily: { start: string; end: string };
    monthly: { start: string; end: string };
  };
}

const levelConfig = {
  info: { 
    icon: Info, 
    color: 'text-blue-600', 
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    chartColor: '#3b82f6',
    label: 'Info'
  },
  warn: { 
    icon: AlertTriangle, 
    color: 'text-amber-600', 
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    chartColor: '#f59e0b',
    label: 'Warning'
  },
  error: { 
    icon: XCircle, 
    color: 'text-red-600', 
    bg: 'bg-red-50',
    border: 'border-red-200',
    chartColor: '#ef4444',
    label: 'Error'
  },
  debug: { 
    icon: Bug, 
    color: 'text-gray-500', 
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    chartColor: '#6b7280',
    label: 'Debug'
  },
};

const formatDate = (dateString: string, formatStr = 'MMM dd') => {
  try {
    return format(parseISO(dateString), formatStr);
  } catch (e) {
    return dateString;
  }
};

const formatNumber = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-800 mb-2 border-b pb-1">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600">{entry.name}</span>
          </div>
          <span className="font-medium text-gray-900">{entry.value.toLocaleString()}</span>
        </div>
      ))}
      <div className="border-t mt-1.5 pt-1.5 flex justify-between font-semibold text-gray-800">
        <span>Total</span>
        <span>{total.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      const url = new URL('/api/logs/stats', window.location.origin);
      if (selectedSource) {
        url.searchParams.append('source', selectedSource);
      }
      
      const response = await fetch(url.toString());
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch statistics');
      }

      setStats(data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedSource]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
        <button 
          onClick={fetchStats}
          className="ml-4 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No statistics available</p>
      </div>
    );
  }

  const { summary } = stats;

  // Transform chart data
  const transformChartData = (data: LogData[], isDaily: boolean) => {
    return data.map(item => {
      const result: any = { 
        date: formatDate(item.date, isDaily ? 'MMM dd' : 'MMM yyyy'),
      };
      Object.keys(levelConfig).forEach(level => {
        result[level] = 0;
      });
      item.logs.forEach(log => {
        result[log.level] = log.count;
      });
      result.total = item.total || 0;
      return result;
    });
  };

  const dailyChartData = transformChartData(stats.daily, true);
  const monthlyChartData = transformChartData(stats.monthly, false);

  // Level breakdown for the proportion bar
  const totalByLevel = summary.totalLogs || 1; // prevent division by zero
  const levelOrder: Array<keyof typeof levelConfig> = ['info', 'warn', 'error', 'debug'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Log Statistics</h1>
          <p className="text-sm text-gray-500 mt-1">
            {selectedSource ? `Filtered by source: ${selectedSource}` : 'All sources'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full"
            >
              <option value="">All Sources</option>
              {stats.sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
          
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Logs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(summary.totalLogs)}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">All time</p>
        </div>

        {/* Logs Today */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Logs Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(summary.logsToday)}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">This week: {formatNumber(summary.logsThisWeek)}</p>
        </div>

        {/* Error Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Error Rate (24h)</p>
              <p className={`text-2xl font-bold mt-1 ${summary.errorRate24h > 10 ? 'text-red-600' : summary.errorRate24h > 5 ? 'text-amber-600' : 'text-gray-900'}`}>
                {summary.errorRate24h}%
              </p>
            </div>
            <div className={`p-3 rounded-lg ${summary.errorRate24h > 10 ? 'bg-red-50' : summary.errorRate24h > 5 ? 'bg-amber-50' : 'bg-gray-50'}`}>
              <Zap className={`w-5 h-5 ${summary.errorRate24h > 10 ? 'text-red-600' : summary.errorRate24h > 5 ? 'text-amber-600' : 'text-gray-500'}`} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{summary.last24hErrors} errors / {summary.last24hTotal} total (24h)</p>
        </div>

        {/* Active Sources */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Sources</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.sources.length}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <Server className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Distinct log sources</p>
        </div>
      </div>

      {/* Level Breakdown Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Log Level Distribution</h3>
        
        {/* Proportion bar */}
        <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
          {levelOrder.map(level => {
            const count = summary.levelBreakdown[level] || 0;
            const pct = (count / totalByLevel) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={level}
                className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                style={{ 
                  width: `${pct}%`, 
                  backgroundColor: levelConfig[level].chartColor,
                  minWidth: pct > 0 ? '4px' : '0',
                }}
                title={`${levelConfig[level].label}: ${count.toLocaleString()} (${pct.toFixed(1)}%)`}
              />
            );
          })}
        </div>

        {/* Level stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          {levelOrder.map(level => {
            const config = levelConfig[level];
            const Icon = config.icon;
            const count = summary.levelBreakdown[level] || 0;
            const pct = summary.totalLogs > 0 ? ((count / summary.totalLogs) * 100).toFixed(1) : '0.0';
            return (
              <div key={level} className={`${config.bg} ${config.border} border rounded-lg p-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{formatNumber(count)}</p>
                <p className="text-xs text-gray-500">{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Logs Chart - Stacked Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-800">Daily Log Volume</h3>
            <p className="text-xs text-gray-400 mt-0.5">Last 30 days</p>
          </div>
        </div>
        {dailyChartData.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500 text-sm">
            No data available for the last 30 days
          </div>
        ) : (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyChartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  width={45}
                  tickFormatter={(v) => formatNumber(v)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                />
                {levelOrder.map((level) => (
                  <Bar
                    key={level}
                    dataKey={level}
                    name={levelConfig[level].label}
                    stackId="logs"
                    fill={levelConfig[level].chartColor}
                    radius={level === 'debug' ? [2, 2, 0, 0] : [0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Monthly Logs Chart - Line */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-800">Monthly Log Trend</h3>
            <p className="text-xs text-gray-400 mt-0.5">Last 12 months</p>
          </div>
        </div>
        {monthlyChartData.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500 text-sm">
            No data available for the last 12 months
          </div>
        ) : (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyChartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  width={45}
                  tickFormatter={(v) => formatNumber(v)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                />
                {levelOrder.map((level) => (
                  <Line
                    key={level}
                    type="monotone"
                    dataKey={level}
                    name={levelConfig[level].label}
                    stroke={levelConfig[level].chartColor}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0, fill: levelConfig[level].chartColor }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Events & Top Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-4 h-4 text-gray-400" />
            <h3 className="text-base font-semibold text-gray-800">Top Events</h3>
          </div>
          {summary.topEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No events recorded</p>
          ) : (
            <div className="space-y-1">
              <div className="grid grid-cols-[1fr_auto_auto] gap-3 text-xs font-medium text-gray-400 uppercase tracking-wider px-3 pb-2 border-b border-gray-100">
                <span>Event</span>
                <span className="text-right">Count</span>
                <span className="text-right w-20">Last Seen</span>
              </div>
              {summary.topEvents.map((item, idx) => {
                const maxCount = summary.topEvents[0]?.count || 1;
                const barWidth = (item.count / maxCount) * 100;
                return (
                  <div key={item.event} className="relative group">
                    {/* Background bar */}
                    <div 
                      className="absolute inset-y-0 left-0 bg-blue-50 rounded transition-all group-hover:bg-blue-100"
                      style={{ width: `${barWidth}%` }}
                    />
                    <div className="relative grid grid-cols-[1fr_auto_auto] gap-3 items-center px-3 py-2 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-mono text-gray-400 w-4 shrink-0">{idx + 1}</span>
                        <span className="text-gray-800 font-medium truncate">{item.event}</span>
                      </div>
                      <span className="text-gray-600 font-mono text-xs tabular-nums">{item.count.toLocaleString()}</span>
                      <span className="text-gray-400 text-xs w-20 text-right whitespace-nowrap">
                        {formatDistanceToNow(new Date(item.lastSeen), { addSuffix: true }).replace('about ', '')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Sources */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-4 h-4 text-gray-400" />
            <h3 className="text-base font-semibold text-gray-800">Top Sources</h3>
          </div>
          {summary.topSources.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No sources recorded</p>
          ) : (
            <div className="space-y-1">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 text-xs font-medium text-gray-400 uppercase tracking-wider px-3 pb-2 border-b border-gray-100">
                <span>Source</span>
                <span className="text-right">Logs</span>
                <span className="text-right">Errors</span>
                <span className="text-right w-20">Last Seen</span>
              </div>
              {summary.topSources.map((item, idx) => {
                const maxCount = summary.topSources[0]?.count || 1;
                const barWidth = (item.count / maxCount) * 100;
                return (
                  <div key={item.source} className="relative group">
                    <div 
                      className="absolute inset-y-0 left-0 bg-purple-50 rounded transition-all group-hover:bg-purple-100"
                      style={{ width: `${barWidth}%` }}
                    />
                    <div className="relative grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center px-3 py-2 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-mono text-gray-400 w-4 shrink-0">{idx + 1}</span>
                        <span className="text-gray-800 font-medium truncate">{item.source}</span>
                      </div>
                      <span className="text-gray-600 font-mono text-xs tabular-nums">{item.count.toLocaleString()}</span>
                      <span className={`font-mono text-xs tabular-nums ${item.errorCount > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {item.errorCount > 0 ? item.errorCount.toLocaleString() : '—'}
                      </span>
                      <span className="text-gray-400 text-xs w-20 text-right whitespace-nowrap">
                        {formatDistanceToNow(new Date(item.lastSeen), { addSuffix: true }).replace('about ', '')}
                      </span>
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
