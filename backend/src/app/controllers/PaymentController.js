const PaymentService = require("../services/PaymentService")

class PaymentController {
  async createMomoPayment(req, res, next) {
    try {
      const userId = req.user._id
      const { orderId } = req.body
      console.log("USERID, ", userId)
      console.log("ORDERID ", orderId)
      const result = await PaymentService.createMomoPayment(userId, orderId)
      return res.status(200).json({ success: true, data: result })
    } catch (err) {
      next(err)
    }
  }

  async momoIPN(req, res) {
    console.log("========== MOMO IPN ==========")

    console.log("Headers:")
    console.log(req.headers)

    console.log("Body:")
    console.log(req.body)

    return res.status(200).json({
      success: true,
      message: "MoMo IPN received",
    })
  }
}

module.exports = new PaymentController()
