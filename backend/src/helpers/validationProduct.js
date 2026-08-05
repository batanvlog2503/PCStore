const { check } = require("express-validator")

exports.addProductValidator = [
  check("category_id")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid category id"),

  check("brand_id")
    .trim()
    .notEmpty()
    .withMessage("Brand is required")
    .isMongoId()
    .withMessage("Invalid brand id"),

  check("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ max: 255 })
    .withMessage("Product name must not exceed 255 characters"),

  check("slug")
    .trim()
    .notEmpty()
    .withMessage("Slug is required")
    .isLength({ max: 255 })
    .withMessage("Slug must not exceed 255 characters"),

  check("description").optional().trim(),

  check("status")
    .optional()
    .isIn(["active", "hidden"])
    .withMessage("Status must be active or hidden"),
]

exports.updateProductValidator = [
  check("category_id")
    .optional()
    .isMongoId()
    .withMessage("Invalid category id"),

  check("brand_id").optional().isMongoId().withMessage("Invalid brand id"),

  check("name")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Product name must not exceed 255 characters"),

  check("slug")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Slug must not exceed 255 characters"),

  check("description").optional().trim(),

  check("status")
    .optional()
    .isIn(["active", "hidden"])
    .withMessage("Status must be active or hidden"),
]
