const mongoose = require("mongoose")
const { Schema } = mongoose

const CartItemSchema = new Schema({
  cart_id: { type: Schema.Types.ObjectId, ref: "Cart", required: true },
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  variant_id: { type: Schema.Types.ObjectId, ref: "ProductVariant", default: null },
  quantity: { type: Number, required: true, default: 1, min: 1 },
})

CartItemSchema.index({ cart_id: 1 })
CartItemSchema.index({ product_id: 1 })

module.exports = mongoose.model("CartItem", CartItemSchema)