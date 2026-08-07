const ReviewService = require("../services/ReviewService")

class ReviewController {
  async getAllReviews(req, res, next) {
    try {
      const result = await ReviewService.getAllReviews()

      return res.status(200).json({
        success: true,
        message: "Get all reviews successfully",
        ...result,
      })
    } catch (error) {
      next(error)
    }
  }

  async getReviewById(req, res, next) {
    try {
      const review = await ReviewService.getReviewById(req.params.id)

      return res.status(200).json({
        success: true,
        message: "Get review successfully",
        review,
      })
    } catch (error) {
      next(error)
    }
  }

  async createReview(req, res, next) {
    try {
      const review = await ReviewService.createReview(req.body)

      return res.status(201).json({
        success: true,
        message: "Create review successfully",
        review,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateReview(req, res, next) {
    try {
      const review = await ReviewService.updateReview(req.params.id, req.body)

      return res.status(200).json({
        success: true,
        message: "Update review successfully",
        review,
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteReview(req, res, next) {
    try {
      const result = await ReviewService.deleteReview(req.params.id)

      return res.status(200).json({
        success: true,
        ...result,
      })
    } catch (error) {
      next(error)
    }
  }

  async getReviewsByProduct(req, res, next) {
    try {
      const result = await ReviewService.getReviewsByProduct(
        req.params.productId,
      )

      return res.status(200).json({
        success: true,
        message: "Get reviews successfully",
        total: result.total,
        reviews: result.reviews,
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new ReviewController()
