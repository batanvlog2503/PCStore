const mongoose = require("mongoose")
const { Schema } = mongoose

const CartItemSchema = new Schema({
  cart_id: {
    type: Schema.Types.ObjectId,
    ref: "Cart",
    required: true,
  },

  variant_id: {
    type: Schema.Types.ObjectId,
    ref: "ProductVariant",
    required: true,
  },

  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
})
CartItemSchema.index({ cart_id: 1 })
CartItemSchema.index({ product_id: 1 })

module.exports = mongoose.model("CartItem", CartItemSchema)
