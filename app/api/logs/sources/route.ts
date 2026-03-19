import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Log from "@/models/Log";
import { authenticateUser, createErrorResponse, createSuccessResponse } from "@/lib/middleware";

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);

    if (!auth) {
      return createErrorResponse("Unauthorized", 401);
    }

    await connectDB();
    
    const sources = await Log.find({ ownerId: auth.userId }).distinct("source");
    
    return createSuccessResponse({
      sources: sources.filter(Boolean).sort() // Remove any empty strings and sort alphabetically
    });
  } catch (error) {
    console.error("Error fetching sources:", error);
    return createErrorResponse("Failed to fetch sources", 500);
  }
}
