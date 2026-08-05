const { check } = require("express-validator")

exports.addBrandValidator = [
  check("name")
    .trim()
    .notEmpty()
    .withMessage("Brand name is required")
    .isLength({ max: 255 })
    .withMessage("Brand name must not exceed 255 characters"),

  check("logo_url").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Logo is required")
    }
    return true
  }),
]

exports.updateBrandValidator = [
  check("name")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Brand name must not exceed 255 characters"),
]
