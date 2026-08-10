const mongoose = require("mongoose")
const { Schema } = mongoose

const ProductVariantSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  // stock keeping unit mã quản lý nội bộ unique
  sku: { type: String, required: true, unique: true, maxlength: 100 },
  // configName tên cấu hình
  config_name: { type: String, required: true, maxlength: 255 },
  // giá

  // Thông số kỹ thuật — tách riêng object cho gọn, dễ mở rộng thêm sau
  // (VD: sau này thêm màu, cân nặng, pin... không làm rối root schema)
  specs: {
    cpu: { type: String, required: true }, // "Intel Core i5-13420H"
    ram: { type: Number, required: true }, // 16 (đơn vị GB, lưu số để filter/sort được)
    storage_capacity: { type: Number, required: true }, // 512 (đơn vị GB)
    storage_type: { type: String, enum: ["SSD", "HDD"], default: "SSD" },
    gpu: { type: String, required: true }, // "RTX 4050"
    screen_size: { type: Number, required: true }, // 15.6 (inch)
    screen_resolution: { type: String }, // "Full HD", "2.5K", "WUXGA"
  },
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
