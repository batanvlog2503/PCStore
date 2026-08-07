const { check } = require("express-validator")

exports.addVoucherValidator = [
  check("code")
    .notEmpty()
    .withMessage("Voucher code is required")
    .isLength({ max: 50 })
    .withMessage("Voucher code must be less than 50 characters"),

  check("discount_type")
    .notEmpty()
    .withMessage("Discount type is required")
    .isIn(["percent", "fixed"])
    .withMessage("Discount type must be percent or fixed"),

  check("discount_value")
    .notEmpty()
    .withMessage("Discount value is required")
    .isFloat({ min: 0 })
    .withMessage("Discount value must be greater than or equal to 0"),

  check("max_discount")
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Max discount must be greater than or equal to 0"),

  check("min_order_value")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum order value must be greater than or equal to 0"),

  check("quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Quantity must be greater than or equal to 0"),

  check("start_date")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date is invalid"),

  check("end_date")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date is invalid"),

  check("status")
    .optional()
    .isIn(["active", "inactive", "expired"])
    .withMessage("Invalid status"),
]

exports.updateVoucherValidator = [
  check("code")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Voucher code must be less than 50 characters"),

  check("discount_type")
    .optional()
    .isIn(["percent", "fixed"])
    .withMessage("Discount type must be percent or fixed"),

  check("discount_value")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount value must be greater than or equal to 0"),

  check("max_discount")
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Max discount must be greater than or equal to 0"),

  check("min_order_value")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum order value must be greater than or equal to 0"),

  check("quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Quantity must be greater than or equal to 0"),

  check("start_date")
    .optional()
    .isISO8601()
    .withMessage("Start date is invalid"),

  check("end_date").optional().isISO8601().withMessage("End date is invalid"),

  check("status")
    .optional()
    .isIn(["active", "inactive", "expired"])
    .withMessage("Invalid status"),
]
