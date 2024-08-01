import { Document } from 'mongoose';

export interface IComment extends Document {
  movie_id: number;
  username: string;
  comment: string;
  title: string;
  rating: number;
  downvotes: number;
  upvotes: number;
  created_at?: Date;
}
