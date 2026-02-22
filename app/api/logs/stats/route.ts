import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Log from '@/models/Log';
import { authenticateUser, createErrorResponse, createSuccessResponse } from '@/lib/middleware';
import { subDays, subMonths, format, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

async function getLogsByTimeRange(startDate: Date, endDate: Date, groupBy: 'day' | 'month', ownerId: string, source?: string) {
  const match: any = {
    createdAt: { $gte: startDate, $lte: endDate },
    ownerId: ownerId,
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
          [dateField]: { $dateToString: { format: formatString, date: '$createdAt' } },
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
      },
    },
    { $sort: { date: 1 } },
  ]);
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

    // Get available sources for filter
    const sources = await Log.distinct('source', { ownerId: auth.userId });

    return createSuccessResponse({
      daily: dailyLogs,
      monthly: monthlyLogs,
      sources,
      timeRange: {
        daily: { start: thirtyDaysAgo, end: new Date() },
        monthly: { start: oneYearAgo, end: new Date() },
      },
    });
  } catch (error) {
    console.error('Error fetching log stats:', error);
    return createErrorResponse('Failed to fetch log stats', 500);
    console.error('Get log stats error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
