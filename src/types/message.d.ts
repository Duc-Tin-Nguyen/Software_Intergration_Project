import mongoose from 'mongoose';

export interface IMessage extends mongoose.Document {
  name: string;
  user: mongoose.Schema.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}
