import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    content: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
    },
    recieverType: {
      type: mongoose.Schema.Types.String,
      enum: ["single", "all"],
      default: "single",
    },
  },
  { timestamps: true, autoIndex: true, cleanIndexes: true },
);
export const Notification = mongoose.model("notifications", notificationSchema);
