const express = require("express")

const router = express.Router()
const auth = require("../app/middlewares/auth")
const PaymentController = require("../app/controllers/PaymentController")

router.post("/momo/create", auth, PaymentController.createMomoPayment)
router.get("/momo/return", (req, res) => {
  console.log("MoMo return:", req.query)

  res.json({
    success: true,
    message: "Returned from MoMo",
    data: req.query,
  })
})
router.post("/momo/ipn", PaymentController.momoIPN)
module.exports = router
