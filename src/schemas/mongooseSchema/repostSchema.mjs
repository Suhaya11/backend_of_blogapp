import mongoose from "mongoose";

const commentReportSchema = new mongoose.Schema({
  reason: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
  reporter: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
  commentId: {
    type: mongoose.Schema.Types.String,
  },
});
const postReportScehma = new mongoose.Schema({
  reason: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
  reporter: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.String,
  },
});
export const CommentReport = mongoose.model(
  "CommentReport",
  commentReportSchema,
);
export const postReport = mongoose.model("postReports", commentReportSchema);
