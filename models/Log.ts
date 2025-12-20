import mongoose, { Schema, model, models } from "mongoose";

export interface ILog {
  _id: string;
  level: "info" | "warn" | "error" | "debug";
  event: string;
  source: string;
  metadata?: Record<string, any>;
  userAgent?: string;
  ip?: string;
  user?: Record<string, any>;
  apiKeyId: mongoose.Types.ObjectId;
  timestamp: string;
}

const LogSchema = new Schema<ILog>(
  {
    level: {
      type: String,
      enum: ["info", "warn", "error", "debug"],
      required: [true, "Log level is required"],
      index: true,
    },
    event: {
      type: String,
      required: [true, "Log event is required"],
      index: true,
    },
    source: {
      type: String,
      required: [true, "Log source is required"],
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    userAgent: {
      type: String,
    },
    ip: {
      type: String,
    },
    user: {
      type: Schema.Types.Mixed,
    },
    apiKeyId: {
      type: Schema.Types.ObjectId,
      ref: "ApiKey",
      required: true,
      index: true,
    },
    timestamp: {
      type: String,
      required: [true, "Log timestamp is required"],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index for efficient querying
LogSchema.index({ createdAt: -1 });
LogSchema.index({ level: 1, createdAt: -1 });
LogSchema.index({ source: 1, createdAt: -1 });
LogSchema.index({ event: 1, createdAt: -1 });

const Log = models.Log || model<ILog>("Log", LogSchema);

export default Log;
