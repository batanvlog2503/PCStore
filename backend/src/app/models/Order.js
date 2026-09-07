const mongoose = require("mongoose")

const { Schema } = mongoose

const OrderSchema = new Schema(
  {
    // =========================
    // Người đặt hàng
    // =========================
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =========================
    // Địa chỉ giao hàng
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
    // Mã đơn hàng
    // =========================
    order_code: {
      type: String,
      required: true,
      unique: true,
      maxlength: 50,
    },

    // =========================
    // Tiền hàng
    // =========================
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    product_discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    voucher_discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    shipping_fee: {
      type: Number,
      default: 0,
      min: 0,
    },

    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // =========================
    // Trạng thái đơn hàng
    // =========================
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "completed", "cancelled"],
      default: "pending",
    },

    // =========================
    // Thanh toán
    // =========================
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

    // Mã giao dịch ngân hàng
    payment_reference: {
      type: String,
      default: null,
    },

    // ID giao dịch từ SePay
    sepay_transaction_id: {
      type: Number,
      default: null,
    },

    // Thời gian thanh toán thành công
    paid_at: {
      type: Date,
      default: null,
    },

    // =========================
    // Ghi chú
    // =========================
    note: {
      type: String,
      default: null,
      maxlength: 500,
    },

    completed_at: {
      type: Date,
      default: null,
    },

    cancelled_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
)

OrderSchema.index({ user_id: 1 })
OrderSchema.index({ order_code: 1 })

module.exports = mongoose.model("Order", OrderSchema)
