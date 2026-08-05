const mongoose = require("mongoose")
const { Schema } = mongoose

// Chỉ chứa thông tin mô tả — price/stock nằm ở ProductVariant
const ProductSchema = new Schema(
  {
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand_id: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    name: { type: String, required: true, maxlength: 255 },
    slug: { type: String, required: true, unique: true, maxlength: 255 },
    description: { type: String },
    rating_avg: { type: Number, default: 0, min: 0, max: 5 },
    sold_count: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["active", "hidden"], default: "active" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
)

ProductSchema.index({ category_id: 1 })
ProductSchema.index({ brand_id: 1 })

module.exports = mongoose.model("Product", ProductSchema)
