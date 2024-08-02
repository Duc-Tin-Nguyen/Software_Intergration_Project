import mongoose, { Schema } from 'mongoose';
import { IComment } from '../types/comment.types'; 

const commentSchema: Schema<IComment> = new Schema(
  {
    movie_id: {
      type: Number,
      required: [true, 'movie is required'],
    },
    username: {
      type: String,
      required: [true, 'username is required'],
    },
    comment: {
      type: String,
      required: [true, 'comment is required'],
    },
    title: {
      type: String,
      required: [true, 'title is required'],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      required: [true, 'rating is required'],
    },
    downvotes: {
      type: Number,
      min: 0,
      default: 0,
    },
    upvotes: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
    },
  }
);

const CommentModel = mongoose.model<IComment>('Comment', commentSchema);

export default CommentModel;
