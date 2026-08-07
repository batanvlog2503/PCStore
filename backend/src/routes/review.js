const express = require("express")
const auth = require("../app/middlewares/auth")

const ReviewController = require("../app/controllers/ReviewController")

const {
  addReviewValidator,
  updateReviewValidator,
} = require("../helpers/validationReview")

const router = express.Router()

router.get("/all", auth, ReviewController.getAllReviews)

router.get("/:id", auth, ReviewController.getReviewById)

router.post("/add", auth, addReviewValidator, ReviewController.createReview)

router.put(
  "/update/:id",
  auth,
  updateReviewValidator,
  ReviewController.updateReview,
)

router.delete("/delete/:id", auth, ReviewController.deleteReview)
router.get("/product/:productId", auth, ReviewController.getReviewsByProduct)
module.exports = router
