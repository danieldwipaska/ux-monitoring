import mongoose, { Schema, model, models } from 'mongoose';

export interface IApiKey {
  _id: string;
  name: string;
  key: string;
  userId: mongoose.Types.ObjectId;
  isActive: boolean;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    name: {
      type: String,
      required: [true, 'API Key name is required'],
      trim: true,
    },
    key: {
      type: String,
      required: [true, 'API Key is required'],
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsed: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const ApiKey = models.ApiKey || model<IApiKey>('ApiKey', ApiKeySchema);

export default ApiKey;
