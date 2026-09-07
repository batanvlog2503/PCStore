const PaymentService = require("../services/PaymentService")
const OrderRepo = require("../repositories/OrderRepository")
class PaymentController {
  async sepayWebhook(req, res, next) {
    try {
      const authorization = req.headers.authorization

      const expectedAuthorization = `Apikey ${process.env.SEPAY_WEBHOOK_API_KEY}`

      if (authorization !== expectedAuthorization) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized webhook",
        })
      }

      const {
        content,
        description,
        transferAmount,
        transferType,
        referenceCode,
        id,
      } = req.body

      console.log("========== SEPAY WEBHOOK ==========")
      console.log(req.body)

      // Chỉ nhận tiền vào
      if (transferType !== "in") {
        return res.status(200).json({
          success: true,
          message: "Transaction ignored",
        })
      }

      // =========================
      // Lấy mã DHxxxx đầy đủ
      // =========================

      const transactionText = `${content || ""} ${description || ""}`

      const match = transactionText.match(/DH\d+/)

      if (!match) {
        console.log("❌ Không tìm thấy order code")

        return res.status(200).json({
          success: true,
          message: "Order code not found",
        })
      }

      const orderCode = match[0]

      console.log("ORDER CODE:", orderCode)

      const order = await OrderRepo.findByOrderCode(orderCode)

      console.log("ORDER FOUND:", order)

      if (!order) {
        return res.status(200).json({
          success: true,
          message: "Order not found",
        })
      }

      if (order.payment_status === "paid") {
        return res.status(200).json({
          success: true,
          message: "Order already paid",
        })
      }

      if (Number(transferAmount) < Number(order.total_amount)) {
        return res.status(200).json({
          success: true,
          message: "Insufficient payment amount",
        })
      }

      const updatedOrder = await OrderRepo.updateById(order._id, {
        payment_status: "paid",
        status: "confirmed",

        payment_reference: referenceCode,
        sepay_transaction_id: id,
        paid_at: new Date(),
      })

      console.log("UPDATED ORDER:", updatedOrder)

      return res.status(200).json({
        success: true,
        message: "Payment confirmed successfully",
      })
    } catch (error) {
      console.error(" SEPAY ERROR:", error)

      next(error)
    }
  }
}

module.exports = new PaymentController()
