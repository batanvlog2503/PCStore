const mongoose = require("mongoose")

const { Schema } = mongoose
// để biết người nào dùng voucher nào
const UserVoucherSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    voucher_id: {
      type: Schema.Types.ObjectId,
      ref: "Voucher",
      required: true,
    },

    status: {
      type: String,
      enum: ["available", "used"],
      default: "available",
    },

    used_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "received_at",
      updatedAt: false,
    },
  },
)
// đảm bảo mỗi người dùng không dùng 2 voucher liên tục
UserVoucherSchema.index({ user_id: 1, voucher_id: 1 }, { unique: true })

module.exports = mongoose.model("UserVoucher", UserVoucherSchema)
