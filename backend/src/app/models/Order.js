const mongoose = require("mongoose")
const { Schema } = mongoose

const OrderSchema = new Schema(
  {
    // =========================
    // 1. Người đặt hàng
    // =========================
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =========================
    // 2. Địa chỉ giao hàng
    // =========================
    address_id: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    voucher_id: {
      type: Schema.Types.ObjectId,
      ref: "Voucher",
      default: null,
    },

    // =========================
    // 4. Mã đơn hàng
    // =========================
    order_code: {
      type: String,
      required: true,
      unique: true,
      maxlength: 50,
    },

    // =========================
    // 5. Tiền hàng trước giảm giá
    // =========================
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    // =========================
    // 6. Tổng giảm giá từ sản phẩm
    // =========================
    product_discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =========================
    // 7. Giảm giá voucher
    // =========================
    voucher_discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =========================
    // 8. Phí vận chuyển
    // =========================
    shipping_fee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =========================
    // 9. Tổng tiền cuối cùng
    // =========================
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // =========================
    // 10. Trạng thái đơn
    // =========================
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "completed", "cancelled"],
      default: "pending",
    },

    payment_method: {
      type: String,
      enum: ["cod", "bank"],
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    note: {
      type: String,
      default: null,
      maxlength: 500,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  },
)

OrderSchema.index({ user_id: 1 })
OrderSchema.index({ order_code: 1 })

module.exports = mongoose.model("Order", OrderSchema)
