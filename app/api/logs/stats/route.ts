import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Log from '@/models/Log';
import { authenticateUser, createErrorResponse, createSuccessResponse } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);
    
    if (!auth) {
      return createErrorResponse('Unauthorized', 401);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '24');

    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    // Get stats by level
    const levelStats = await Log.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$level', count: { $sum: 1 } } },
    ]);

    // Get stats by source
    const sourceStats = await Log.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get total count
    const totalLogs = await Log.countDocuments({ createdAt: { $gte: startDate } });

    // Get logs over time (hourly)
    const logsOverTime = await Log.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d %H:00',
              date: '$createdAt',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return createSuccessResponse({
      totalLogs,
      levelStats: levelStats.map((stat) => ({
        level: stat._id,
        count: stat.count,
      })),
      sourceStats: sourceStats.map((stat) => ({
        source: stat._id,
        count: stat.count,
      })),
      logsOverTime: logsOverTime.map((stat) => ({
        time: stat._id,
        count: stat.count,
      })),
    });
  } catch (error) {
    console.error('Get log stats error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
