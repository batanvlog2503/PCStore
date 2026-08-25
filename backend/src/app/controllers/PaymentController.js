const PaymentService = require("../services/PaymentService")

class PaymentController {
  async createMomoPayment(req, res) {
    const userId = req.user._id

    const { orderId } = req.body
    console.log("ORDER USER:", orderId)
    console.log("CURRENT USER:", userId)
    const result = await PaymentService.createMomoPayment(userId, orderId)

    return res.status(200).json({
      success: true,
      data: result,
    })
  }
}

module.exports = new PaymentController()
