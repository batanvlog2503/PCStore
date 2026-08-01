const mongoose = require("mongoose")
const { Schema } = mongoose

const PaymentSchema = new Schema({
  order_id: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
  method: { type: String, required: true, maxlength: 50 },
  status: { type: String, required: true, maxlength: 50 },
  transaction_id: { type: String, unique: true, sparse: true, maxlength: 255 },
  paid_at: { type: Date, default: null },
})

module.exports = mongoose.model("Payment", PaymentSchema)