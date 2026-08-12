const mongoose = require("mongoose")
const { Schema } = mongoose

const ProductImageSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  image_url: { type: String, required: true, maxlength: 500 },
  is_main: { type: Boolean, default: false },
})

ProductImageSchema.index({ product_id: 1 })

module.exports = mongoose.model("ProductImage", ProductImageSchema)
