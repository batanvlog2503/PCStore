const { check } = require("express-validator")

exports.addOrderValidator = [
  check("user_id")
    .notEmpty()
    .withMessage("User Id is required")
    .isMongoId()
    .withMessage("User Id is invalid"),

  check("address_id")
    .notEmpty()
    .withMessage("Address Id is required")
    .isMongoId()
    .withMessage("Address Id is invalid"),

  check("voucher_id")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("Voucher Id is invalid"),

  check("order_code")
    .notEmpty()
    .withMessage("Order code is required")
    .isLength({ max: 50 })
    .withMessage("Order code must be less than 50 characters"),

  check("total_amount")
    .notEmpty()
    .withMessage("Total amount is required")
    .isFloat({ min: 0 })
    .withMessage("Total amount must be greater than or equal to 0"),

  check("status")
    .optional()
    .isIn(["pending", "shipping", "completed", "cancelled"])
    .withMessage("Invalid status"),

  check("payment_method")
    .notEmpty()
    .withMessage("Payment method is required")
    .isIn(["cash", "bank"])
    .withMessage("Payment method must be cash or bank"),

  check("payment_status")
    .optional()
    .isIn(["pending", "paid"])
    .withMessage("Invalid payment status"),
]

exports.updateOrderValidator = [
  check("user_id").optional().isMongoId().withMessage("User Id is invalid"),

  check("address_id")
    .optional()
    .isMongoId()
    .withMessage("Address Id is invalid"),

  check("voucher_id")
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage("Voucher Id is invalid"),

  check("order_code")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Order code must be less than 50 characters"),

  check("total_amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Total amount must be greater than or equal to 0"),

  check("status")
    .optional()
    .isIn(["pending", "shipping", "completed", "cancelled"])
    .withMessage("Invalid status"),

  check("payment_method")
    .optional()
    .isIn(["cash", "bank"])
    .withMessage("Payment method must be cash or bank"),

  check("payment_status")
    .optional()
    .isIn(["pending", "paid"])
    .withMessage("Invalid payment status"),
]
