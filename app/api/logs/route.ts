import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Log from "@/models/Log";
import {
  authenticateUser,
  authenticateApiKey,
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware";
import { logRateLimiter } from "@/lib/rate-limiter";

// GET logs (for dashboard - requires user authentication)
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);

    if (!auth) {
      return createErrorResponse("Unauthorized", 401);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const level = searchParams.get("level");
    const source = searchParams.get("source");
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const query: any = {
      timestamp: {}
    };

    // Add date range filtering
    if (startDate) {
      query.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      query.timestamp.$lte = new Date(endDate);
    }
    // If no date range is specified, remove the timestamp condition
    if (Object.keys(query.timestamp).length === 0) {
      delete query.timestamp;
    }

    if (level) {
      query.level = level;
    }

    if (source) {
      query.source = source;
    }

    if (search) {
      query.$or = [
        { 'metadata.message': { $regex: search, $options: 'i' } },
        { event: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      Log.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("apiKeyId", "name")
        .lean(),
      Log.countDocuments(query),
    ]);

    return createSuccessResponse({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get logs error:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

// POST create a new log (requires API key authentication)
export async function POST(request: NextRequest) {
  try {
    const apiKeyAuth = await authenticateApiKey(request);
    if (!apiKeyAuth) {
      return createErrorResponse("Invalid or missing API key", 401);
    }

    const body = await request.json();
    const { level, event, source, metadata, timestamp } = body;

    if (!level || !event || !source) {
      return createErrorResponse(
        "Level, event, and source are required",
        400
      );
    }

    if (!["info", "warn", "error", "debug"].includes(level)) {
      return createErrorResponse("Invalid log level", 400);
    }

    await connectDB();

    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip");
    const userAgent = request.headers.get("user-agent");

    const log = await Log.create({
      level,
      event,
      source,
      metadata,
      apiKeyId: apiKeyAuth.apiKeyId,
      ip,
      userAgent,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    return createSuccessResponse(
      {
        message: "Log created successfully",
        logId: log._id,
      },
      201
    );
  } catch (error) {
    console.error("Create log error:", error);
    return createErrorResponse("Internal server error", 500);
  }
}
