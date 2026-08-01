const mongoose = require("mongoose")
const { Schema } = mongoose

const ProductVariantSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  sku: { type: String, required: true, unique: true, maxlength: 100 },
  config_name: { type: String, required: true, maxlength: 255 },
  price: { type: Number, required: true, min: 0 },
  discount_price: {
    type: Number,
    min: 0,
    default: null,
    // tương đương CHECK (discount_price IS NULL OR discount_price <= price)
    validate: {
      validator: function (value) {
        if (value === null || value === undefined) return true
        return value <= this.price
      },
      message: "discount_price phải nhỏ hơn hoặc bằng price",
    },
  },
  stock: { type: Number, required: true, default: 0, min: 0 },
  status: {
    type: String,
    enum: ["active", "out_of_stock", "discontinued"],
    default: "active",
  },
})

ProductVariantSchema.index({ product_id: 1 })

module.exports = mongoose.model("ProductVariant", ProductVariantSchema)