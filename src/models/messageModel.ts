import mongoose, { Schema, Document } from 'mongoose';

interface IMessage extends Document {
  name: string;
  user: string; // Using email instead of ObjectId
}

const messageSchema: Schema<IMessage> = new Schema(
  {
    name: { type: String, required: true },
    user: { type: String, required: true, ref: 'User' }, // Referencing by email
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
