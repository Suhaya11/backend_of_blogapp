import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: {
    type: mongoose.Schema.Types.String,
    required: true,
    unique: true,
  },
  password: {
    type: mongoose.Schema.Types.String,
    required: true,
    unique: true,
  },
  secret: {
    type: mongoose.Schema.Types.String,
    required: true,
    unique: true,
  },
  auth: {
    type: mongoose.Schema.Types.String,
    required: true,
    unique: true,
  },
});
export const Admin = mongoose.model("admin", adminSchema);
