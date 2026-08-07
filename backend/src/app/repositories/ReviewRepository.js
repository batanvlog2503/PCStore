const Review = require("../models/Review")

class ReviewRepository {
  async getAll() {
    return await Review.find()
    //   .populate("product_id", "name")
    //   .populate("variant_id")
    //   .populate("user_id", "username")
  }

  async getById(id) {
    return await Review.findById(id)
      .populate("product_id", "name")
      .populate("variant_id")
      .populate("user_id", "username")
  }

  async create(data) {
    return await Review.create(data)
  }

  async update(id, data) {
    return await Review.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
  }

  async delete(id) {
    return await Review.findByIdAndDelete(id)
  }

  async countDocuments() {
    return await Review.countDocuments()
  }
  async findByUserAndVariant(userId, variantId) {
    return await Review.findOne({
      user_id: userId,
      variant_id: variantId,
    })
  }
  // tìm tất cả review của sản phẩm product_id này
  async findByProductId(productId) {
    return await Review.find({
      product_id: productId,
    })
      .populate("user_id", "username")
      .populate("variant_id")
      .sort({ created_at: -1 })
  }
}

module.exports = new ReviewRepository()
