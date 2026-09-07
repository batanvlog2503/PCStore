const express = require("express")

const router = express.Router()
const auth = require("../app/middlewares/auth")
const PaymentController = require("../app/controllers/PaymentController")
const authorize = require("../app/middlewares/authorize")

router.post(
  "/sepay/webhook",

  PaymentController.sepayWebhook,
)
module.exports = router
