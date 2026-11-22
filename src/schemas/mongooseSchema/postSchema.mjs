import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    body: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    poster: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.String,
      required: true,
      unique: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId }],
  },
  {
    timestamps: true,
    autoIndex: true,
    cleanIndexes: true,
  },
);
export const Post = mongoose.model("Post", postSchema);
