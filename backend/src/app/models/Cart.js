const mongoose = require("mongoose")
const { Schema } = mongoose

const CartSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
})

module.exports = mongoose.model("Cart", CartSchema)
