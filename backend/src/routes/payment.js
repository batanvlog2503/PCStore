const express = require("express")

const router = express.Router()
const auth = require("../app/middlewares/auth")
const PaymentController = require("../app/controllers/PaymentController")

router.post("/momo/create", auth, PaymentController.createMomoPayment)

module.exports = router
