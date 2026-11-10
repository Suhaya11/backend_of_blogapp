import mongoose from "mongoose";

const likesSchema = new mongoose.Schema({
  postId: mongoose.Schema.Types.String,
  liker: mongoose.Schema.Types.String,
});

const dislikesSchema = new mongoose.Schema({
  postId: mongoose.Schema.Types.String,
  liker: mongoose.Schema.Types.String,
});

const commentSchema = new mongoose.Schema({
  commenter: {
    type: mongoose.Schema.Types.String,
  },
  message: {
    type: mongoose.Schema.Types.String,
  },
  postId: {
    type: mongoose.Schema.Types.String,
  },
});
export const Comment = mongoose.model("Comment", commentSchema);
export const Dislike = mongoose.model("Dislike", dislikesSchema);
export const Like = mongoose.model("Like", likesSchema);
