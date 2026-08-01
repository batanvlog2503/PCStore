const mongoose = require("mongoose")
const { Schema } = mongoose

const OrderSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    address_id: { type: Schema.Types.ObjectId, ref: "Address", required: true },
    voucher_id: { type: Schema.Types.ObjectId, ref: "Voucher", default: null },
    order_code: { type: String, required: true, unique: true, maxlength: 50 },
    total_amount: { type: Number, required: true, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["pending", "shipping", "completed", "cancelled"],
      default: "pending",
    },
    payment_method: { type: String, required: true, maxlength: 50 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
)

OrderSchema.index({ user_id: 1 })

module.exports = mongoose.model("Order", OrderSchema)