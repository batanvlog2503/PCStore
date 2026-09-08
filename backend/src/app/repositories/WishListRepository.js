const Wishlist = require("../models/Wishlist")
class WishlistRepository {
  async findByUserAndProduct(userId, productId) {
    return await Wishlist.findOne({
      user_id: userId,
      product_id: productId,
    })
  }

  async create(userId, productId) {
    return await Wishlist.create({
      user_id: userId,
      product_id: productId,
    })
  }

  async delete(userId, productId) {
    return await Wishlist.deleteOne({
      user_id: userId,
      product_id: productId,
    })
  }

  async getAllByUser(userId) {
    return await Wishlist.find({
      user_id: userId,
      status: "active",
    })
      .populate("product_id")
      .sort({
        createdAt: -1,
      })
  }
}

module.exports = new WishlistRepository()
