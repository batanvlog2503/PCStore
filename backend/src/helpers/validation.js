const { check } = require("express-validator")

exports.userRegisterValidator = [
  check("username", "username is required").not().isEmpty(),
  check("email", "please include a valid email").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
  check("phone", "Mobile No. Should be contains 10 digits").isLength({
    min: 10,
    max: 10,
  }),
  check(
    "password",
    "Password must be greater than 6 characters, and container at least one Uppercase, one lowercase letter, and one number, and one special character",
  ).isStrongPassword({
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minLength: 6,
    minSymbols: 1,
  }),
]

exports.userLoginValidator = [
  check("email", "please include a valid email").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),

  check(
    "password",
    "Password must be greater than 6 characters, and container at least one Uppercase, one lowercase letter, and one number, and one special character",
  ).isStrongPassword({
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minLength: 6,
    minSymbols: 1,
  }),
]
