const { check } = require("express-validator")

const addReviewValidator = [
  check("product_id")
    .notEmpty()
    .withMessage("Product id is required")
    .isMongoId()
    .withMessage("Product id is invalid"),

  check("variant_id")
    .notEmpty()
    .withMessage("Variant id is required")
    .isMongoId()
    .withMessage("Variant id is invalid"),

  check("user_id")
    .notEmpty()
    .withMessage("User id is required")
    .isMongoId()
    .withMessage("User id is invalid"),

  check("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  check("comment")
    .optional()
    .isString()
    .withMessage("Comment must be a string")
    .isLength({ max: 1000 })
    .withMessage("Comment must not exceed 1000 characters"),
]

const updateReviewValidator = [
  check("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  check("comment")
    .optional()
    .isString()
    .withMessage("Comment must be a string")
    .isLength({ max: 1000 })
    .withMessage("Comment must not exceed 1000 characters"),
]

module.exports = {
  addReviewValidator,
  updateReviewValidator,
}
