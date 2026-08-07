const mongoose = require("mongoose")
const { Schema } = mongoose

const VoucherSchema = new Schema(
  {
    // code là mã giải giá
    code: { type: String, required: true, unique: true, maxlength: 50 },
    // kiểu giảm giá là percent or fixed
    discount_type: { type: String, enum: ["percent", "fixed"], required: true },
    // giá trị
    discount_value: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      // tương đương CHECK: nếu percent thì discount_value <= 100
      validate: {
        validator: function (value) {
          if (this.discount_type === "percent") return value <= 100
          return true
        },
        message:
          "discount_value không được vượt quá 100 khi discount_type là percent",
      },
    },
    max_discount: { type: Number, default: null },
    // đơn tối thiểu để sử dụng voucher
    min_order_value: { type: Number, default: 0, min: 0 },
    // số lượng dùng còn lại
    quantity: { type: Number, default: 0, min: 0 },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.start_date
        },
        message: "end_date phải lớn hơn start_date",
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
)

module.exports = mongoose.model("Voucher", VoucherSchema)
