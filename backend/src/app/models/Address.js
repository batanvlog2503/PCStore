const mongoose = require("mongoose")
const { Schema } = mongoose

const AddressSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver_name: { type: String, required: true, maxlength: 100 },
    phone: { type: String, required: true, maxlength: 20 },
    province: { type: String, required: true, maxlength: 100 },
    district: { type: String, required: true, maxlength: 100 },
    ward: { type: String, required: true, maxlength: 100 },
    detail: { type: String, required: true, maxlength: 255 },
    is_default: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
)

AddressSchema.index({ user_id: 1 })

module.exports = mongoose.model("Address", AddressSchema)
