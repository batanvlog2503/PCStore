const mongoose = require("mongoose")

const { Schema } = mongoose

const PaymentSchema = new Schema(
  {
    order_id: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },

    method: {
      type: String,
      enum: ["momo"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      required: true,
    },

    request_id: {
      // request của server với momo
      type: String,
      required: true,
      unique: true,
      maxlength: 255,
    },

    transaction_id: {
      // momo có transaction identifier để truy lùng giao dịch
      type: String,
      unique: true,
      sparse: true,
      maxlength: 255,
    },

    paid_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Payment", PaymentSchema)
