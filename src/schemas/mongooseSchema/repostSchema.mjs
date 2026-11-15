import mongoose from "mongoose";

const commentReportSchema = new mongoose.Schema(
  {
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
    status: {
      type: mongoose.Schema.Types.String,
    },
    adminMessage: {
      type: mongoose.Schema.Types.String,
    },
  },
  { timestamps: true, clearIndexes: true, autoIndex: true },
);
const postReportScehma = new mongoose.Schema(
  {
    reason: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    reporter: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: mongoose.Schema.Types.String,
    },
    adminMessage: {
      type: mongoose.Schema.Types.String,
    },
  },
  { timestamps: true, clearIndexes: true, autoIndex: true },
);
export const CommentReport = mongoose.model(
  "CommentReport",
  commentReportSchema,
);
export const postReport = mongoose.model("postReports", postReportScehma);
