const mongoose = require("mongoose")
const { Schema } = mongoose

// price được "đóng băng" tại thời điểm mua, không tham chiếu giá hiện tại của variant
const OrderItemSchema = new Schema({
  order_id: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  variant_id: { type: Schema.Types.ObjectId, ref: "ProductVariant", default: null },
  quantity: { type: Number, required: true, default: 1, min: 1 },
  price: { type: Number, required: true, min: 0 },
})

OrderItemSchema.index({ order_id: 1 })

module.exports = mongoose.model("OrderItem", OrderItemSchema)