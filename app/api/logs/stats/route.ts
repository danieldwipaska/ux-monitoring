import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Log from '@/models/Log';
import { authenticateUser, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { subDays, subMonths, startOfDay, startOfWeek } from 'date-fns';

async function getLogsByTimeRange(startDate: Date, endDate: Date, groupBy: 'day' | 'month', ownerId: string, source?: string) {
  const match: any = {
    timestamp: { $gte: startDate, $lte: endDate },
    ownerId: new mongoose.Types.ObjectId(ownerId),
  };

  if (source) {
    match.source = source;
  }

  const formatString = groupBy === 'day' ? '%Y-%m-%d' : '%Y-%m';
  const dateField = groupBy === 'day' ? 'date' : 'month';

  return await Log.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          [dateField]: { $dateToString: { format: formatString, date: '$timestamp' } },
          level: '$level',
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: `$_id.${dateField}`,
        date: { $first: `$_id.${dateField}` },
        logs: {
          $push: {
            level: '$_id.level',
            count: '$count',
          },
        },
        total: { $sum: '$count' },
      },
    },
    { $sort: { date: 1 } },
  ]);
}

async function getSummaryStats(ownerId: string, source?: string) {
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);
  const match: any = { ownerId: ownerObjectId };
  if (source) {
    match.source = source;
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const twentyFourHoursAgo = subDays(now, 1);

  const [
    totalLogs,
    logsToday,
    logsThisWeek,
    levelBreakdown,
    last24hTotal,
    last24hErrors,
    topEvents,
    topSources,
  ] = await Promise.all([
    // Total logs count
    Log.countDocuments(match),

    // Logs today
    Log.countDocuments({ ...match, timestamp: { $gte: todayStart } }),

    // Logs this week
    Log.countDocuments({ ...match, timestamp: { $gte: weekStart } }),

    // Level breakdown
    Log.aggregate([
      { $match: match },
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Last 24h total (for error rate calculation)
    Log.countDocuments({ ...match, timestamp: { $gte: twentyFourHoursAgo } }),

    // Last 24h errors
    Log.countDocuments({ ...match, level: 'error', timestamp: { $gte: twentyFourHoursAgo } }),

    // Top 10 events
    Log.aggregate([
      { $match: match },
      { $group: { _id: '$event', count: { $sum: 1 }, lastSeen: { $max: '$timestamp' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, event: '$_id', count: 1, lastSeen: 1 } },
    ]),

    // Top sources
    Log.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          lastSeen: { $max: '$timestamp' },
          errorCount: {
            $sum: { $cond: [{ $eq: ['$level', 'error'] }, 1, 0] },
          },
          warnCount: {
            $sum: { $cond: [{ $eq: ['$level', 'warn'] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, source: '$_id', count: 1, lastSeen: 1, errorCount: 1, warnCount: 1 } },
    ]),
  ]);

  // Convert level breakdown array to object
  const levels: Record<string, number> = { info: 0, warn: 0, error: 0, debug: 0 };
  levelBreakdown.forEach((item: { _id: string; count: number }) => {
    levels[item._id] = item.count;
  });

  const errorRate24h = last24hTotal > 0 ? (last24hErrors / last24hTotal) * 100 : 0;

  return {
    totalLogs,
    logsToday,
    logsThisWeek,
    levelBreakdown: levels,
    errorRate24h: Math.round(errorRate24h * 100) / 100,
    last24hTotal,
    last24hErrors,
    topEvents,
    topSources,
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);
    
    if (!auth) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || undefined;
    
    // Get last 30 days data
    const thirtyDaysAgo = subDays(new Date(), 30);
    const dailyLogs = await getLogsByTimeRange(thirtyDaysAgo, new Date(), 'day', auth.userId, source);
    
    // Get last 12 months data
    const oneYearAgo = subMonths(new Date(), 12);
    const monthlyLogs = await getLogsByTimeRange(oneYearAgo, new Date(), 'month', auth.userId, source);

    // Get summary statistics
    const summary = await getSummaryStats(auth.userId, source);

    // Get available sources for filter
    const sources = await Log.distinct('source', { ownerId: auth.userId });

    return createSuccessResponse({
      daily: dailyLogs,
      monthly: monthlyLogs,
      summary,
      sources,
      timeRange: {
        daily: { start: thirtyDaysAgo, end: new Date() },
        monthly: { start: oneYearAgo, end: new Date() },
      },
    });
  } catch (error) {
    console.error('Error fetching log stats:', error);
    return createErrorResponse('Failed to fetch log stats', 500);
  }
}
