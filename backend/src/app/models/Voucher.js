const mongoose = require("mongoose")
const { Schema } = mongoose

const VoucherSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      maxlength: 50,
    },

    // Phân loại voucher
    voucher_type: {
      type: String,
      enum: ["product", "shipping"],
      required: true,
      default: "product",
    },

    // Cách giảm giá
    discount_type: {
      type: String,
      enum: ["percent", "fixed"],
      required: true,
    },

    discount_value: {
      type: Number,
      required: true,
      default: 0,
      min: 0,

      validate: {
        validator: function (value) {
          if (this.discount_type === "percent") {
            return value <= 100
          }

          return true
        },
        message: "Giảm phần trăm không được vượt quá 100%",
      },
    },

    // Giảm tối đa
    max_discount: {
      type: Number,
      default: null,
    },

    // Giá trị đơn hàng tối thiểu
    min_order_value: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Số lượng voucher còn lại
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    start_date: {
      type: Date,
      required: true,
    },

    end_date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  },
)

module.exports = mongoose.model("Voucher", VoucherSchema)
