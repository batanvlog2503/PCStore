const mongoose = require("mongoose")
const { Schema } = mongoose

const QuestionSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "hidden"],
      default: "pending",
    },

    admin_reply: {
      type: String,
      trim: true,
      default: null,
      maxlength: 1000,
    },

    replied_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

module.exports = mongoose.model("Question", QuestionSchema)
