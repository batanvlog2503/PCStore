const mongoose = require("mongoose")
const { Schema } = mongoose

const ReviewSchema = new Schema(
  {
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
)

ReviewSchema.index({ product_id: 1 })
ReviewSchema.index({ user_id: 1 })

module.exports = mongoose.model("Review", ReviewSchema)