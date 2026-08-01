const mongoose = require("mongoose")
const { Schema } = mongoose

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      maxlength: 20,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    is_verified: { default: 1, type: String },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
)

module.exports = mongoose.model("User", UserSchema)
