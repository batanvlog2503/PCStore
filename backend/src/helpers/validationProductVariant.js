const { check } = require("express-validator")

exports.addProductVariantValidator = [
  check("product_id")
    .trim()
    .notEmpty()
    .withMessage("Product Id is required")
    .isMongoId()
    .withMessage("Invalid Product Id"),

  check("sku")
    .trim()
    .notEmpty()
    .withMessage("SKU is required")
    .isLength({ max: 100 })
    .withMessage("SKU must not exceed 100 characters"),

  check("config_name")
    .trim()
    .notEmpty()
    .withMessage("Config name is required")
    .isLength({ max: 255 })
    .withMessage("Config name must not exceed 255 characters"),

  check("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be greater than or equal to 0"),

  check("discount_price")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Discount price must be greater than or equal to 0"),

  check("stock")
    .notEmpty()
    .withMessage("Stock is required")
    .isInt({ min: 0 })
    .withMessage("Stock must be greater than or equal to 0"),

  check("status")
    .optional()
    .isIn(["active", "out_of_stock", "discontinued"])
    .withMessage("Invalid status"),
]

exports.updateProductVariantValidator = [
  check("product_id").optional().isMongoId().withMessage("Invalid Product Id"),

  check("sku")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("SKU must not exceed 100 characters"),

  check("config_name")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Config name must not exceed 255 characters"),

  check("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be greater than or equal to 0"),

  check("discount_price")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Discount price must be greater than or equal to 0"),

  check("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be greater than or equal to 0"),

  check("status")
    .optional()
    .isIn(["active", "out_of_stock", "discontinued"])
    .withMessage("Invalid status"),
]
