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
  ChevronDown
} from 'lucide-react';
import { format, subDays, subMonths, parseISO } from 'date-fns';

interface LogData {
  date: string;
  logs: Array<{
    level: string;
    count: number;
  }>;
}

interface StatsResponse {
  daily: LogData[];
  monthly: LogData[];
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
    chartColor: '#3b82f6' // blue-500
  },
  warn: { 
    icon: AlertTriangle, 
    color: 'text-yellow-600', 
    bg: 'bg-yellow-50',
    chartColor: '#eab308' // yellow-500
  },
  error: { 
    icon: XCircle, 
    color: 'text-red-600', 
    bg: 'bg-red-50',
    chartColor: '#ef4444' // red-500
  },
  debug: { 
    icon: Bug, 
    color: 'text-gray-600', 
    bg: 'bg-gray-50',
    chartColor: '#6b7280' // gray-500
  },
};

const formatDate = (dateString: string, formatStr = 'MMM dd') => {
  try {
    return format(parseISO(dateString), formatStr);
  } catch (e) {
    return dateString;
  }
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
        throw new Error(data.message || 'Failed to fetch statistics');
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  const renderChart = (data: LogData[], title: string, xAxisKey: string, isDaily: boolean = true) => {
    if (!data || data.length === 0) {
      return (
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
          No data available for the selected period
        </div>
      );
    }

    // Transform data for recharts
    const chartData = data.map(item => {
      const result: any = { date: formatDate(item.date, isDaily ? 'MMM dd' : 'MMM yyyy') };
      
      // Initialize all levels with 0
      Object.keys(levelConfig).forEach(level => {
        result[level] = 0;
      });
      
      // Set actual values
      item.logs.forEach(log => {
        result[log.level] = log.count;
      });
      
      return result;
    });

    return (
      <div className="bg-white rounded-lg shadow p-4 h-[400px]">
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                width={40}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              {Object.entries(levelConfig).map(([level, config]) => (
                <Line
                  key={level}
                  type="monotone"
                  dataKey={level}
                  name={level.charAt(0).toUpperCase() + level.slice(1)}
                  stroke={config.chartColor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  if (!stats) {
    return (
      <div className="text-center py-10">
        <p>No statistics available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Log Statistics</h1>
          <p className="text-sm text-gray-500 mt-1">
            {selectedSource ? `Showing data for source: ${selectedSource}` : 'Showing data from all sources'}
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

      {/* Daily Logs Chart */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium">Daily Logs (Last 30 Days)</h2>
        {renderChart(stats.daily, 'Logs per Day (Last 30 Days)', 'date')}
      </div>

      {/* Monthly Logs Chart */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium">Monthly Logs (Last 12 Months)</h2>
        {renderChart(stats.monthly, 'Logs per Month (Last 12 Months)', 'month', false)}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        {Object.entries(levelConfig).map(([level, config]) => (
          <div key={level} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: config.chartColor }}
            />
            <span className="capitalize">{level} Logs</span>
          </div>
        ))}
      </div>
    </div>
  );
}
