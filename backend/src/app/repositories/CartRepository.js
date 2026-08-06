const Cart = require("../models/Cart")

class CartRepository {
  async getAll() {
    const [carts, total] = await Promise.all([
      Cart.find().populate("user_id", "full_name email"),
      Cart.countDocuments(),
    ])

    return { carts, total }
  }

  async findById(id) {
    return await Cart.findById(id).populate("user_id", "full_name email")
  }

  async findByUserId(userId) {
    return await Cart.findOne({ user_id: userId }).populate("user_id")
  }

  async create(data) {
    return await Cart.create(data)
  }

  async deleteById(id) {
    return await Cart.findByIdAndDelete(id)
  }
}

module.exports = new CartRepository()
