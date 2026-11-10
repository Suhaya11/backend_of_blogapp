import mongoose from "mongoose";

export const userSchema = new mongoose.Schema(
  {
    username: {
      type: mongoose.Schema.Types.String,
      required: true,
      unique: true,
    },
    password: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    email: {
      type: mongoose.Schema.Types.String,
      unique: true,
      required: true,
    },

    postingId: {
      type: mongoose.Schema.Types.String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true, autoIndex: true, cleanIndexes: true },
);

export const User = mongoose.model("user", userSchema);
