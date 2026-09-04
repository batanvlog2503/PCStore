const mongoose = require("mongoose")
const { Schema } = mongoose

const OrderItemSchema = new Schema(
  {
    order_id: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // Vẫn giữ để biết sản phẩm gốc là sản phẩm nào
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Vẫn giữ để biết variant nào
    variant_id: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },

    // =========================
    // SNAPSHOT TẠI THỜI ĐIỂM MUA
    // =========================
    product_name: {
      type: String,
      required: true,
      maxlength: 255,
    },

    product_image: {
      type: String,
      default: null,
      maxlength: 500,
    },

    sku: {
      type: String,
      required: true,
      maxlength: 100,
    },

    config_name: {
      type: String,
      default: null,
      maxlength: 255,
    },

    // Giá tại thời điểm khách mua
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discount_price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
)

OrderItemSchema.index({ order_id: 1 })
OrderItemSchema.index({ product_id: 1 })
OrderItemSchema.index({ variant_id: 1 })

module.exports = mongoose.model("OrderItem", OrderItemSchema)
