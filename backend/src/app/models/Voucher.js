const mongoose = require("mongoose")
const { Schema } = mongoose

const VoucherSchema = new Schema({
  code: { type: String, required: true, unique: true, maxlength: 50 },
  discount_type: { type: String, enum: ["percent", "fixed"], required: true },
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
      message: "discount_value không được vượt quá 100 khi discount_type là percent",
    },
  },
  min_order_value: { type: Number, default: 0, min: 0 },
  quantity: { type: Number, default: 0, min: 0 },
  end_date: { type: Date, required: true },
  status: { type: String, enum: ["active", "inactive", "expired"], default: "active" },
})

module.exports = mongoose.model("Voucher", VoucherSchema)