import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
  username?: string;
  email: string;
  password: string;
  messages: mongoose.Types.ObjectId[];
}
