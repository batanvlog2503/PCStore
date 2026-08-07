const ReviewRepo = require("../repositories/ReviewRepository")
const AppError = require("../utils/AppError")

class ReviewService {
  async getAllReviews() {
    const [reviews, total] = await Promise.all([
      ReviewRepo.getAll(),
      ReviewRepo.countDocuments(),
    ])

    return { total, reviews }
  }

  async getReviewById(id) {
    if (!id) {
      throw new AppError(400, "Review id is required")
    }

    const review = await ReviewRepo.getById(id)

    if (!review) {
      throw new AppError(404, "Review not found")
    }

    return review
  }

  async createReview(data) {
    const exist = await ReviewRepo.findByUserAndVariant(
      data.user_id,
      data.variant_id,
    )
    // cho phép user review 1 lần
    if (exist) {
      throw new AppError(400, "You already reviewed this product variant")
    }
    const review = await ReviewRepo.create(data)

    return review
  }

  async updateReview(id, data) {
    if (!id) {
      throw new AppError(400, "Review id is required")
    }

    const review = await ReviewRepo.getById(id)

    if (!review) {
      throw new AppError(404, "Review not found")
    }

    return await ReviewRepo.update(id, data)
  }

  async deleteReview(id) {
    if (!id) {
      throw new AppError(400, "Review id is required")
    }

    const review = await ReviewRepo.getById(id)

    if (!review) {
      throw new AppError(404, "Review not found")
    }

    await ReviewRepo.delete(id)

    return {
      message: "Delete review successfully",
    }
  }

  async getReviewsByProduct(productId) {
    if (!productId) {
      throw new AppError(400, "Product id is required")
    }

    const reviews = await ReviewRepo.findByProductId(productId)

    return {
      total: reviews.length,
      reviews,
    }
  }
}

module.exports = new ReviewService()
