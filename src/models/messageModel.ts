import mongoose, { Schema } from 'mongoose';
import { IMessage } from '../types/message';

const messageSchema: Schema<IMessage> = new Schema(
  {
    name: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

const Message = mongoose.model<IMessage>('Message', messageSchema);

export default Message;
