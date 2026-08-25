const PaymentRepo = require("../repositories/PaymentRepository")
const OrderRepo = require("../repositories/OrderRepository")
const MomoGateway = require("../gateway/MomoGateway")

const AppError = require("../utils/AppError")

class PaymentService {
  async createMomoPayment(userId, orderId) {
    // 1. Tìm Order
    const order = await OrderRepo.findById(orderId)

    if (!order) {
      throw new AppError(404, "Order not found")
    }
    console.log("ORDER USER:", order.user_id._id.t)
    console.log("CURRENT USER:", userId)
    // 2. Kiểm tra user sở hữu Order
    if (order.user_id._id.toString() !== userId.toString()) {
      throw new AppError(403, "You do not own this order")
    }

    // 3. Kiểm tra trạng thái Order
    if (order.status === "cancelled") {
      throw new AppError(400, "Cancelled order cannot be paid")
    }

    // 4. Không cho thanh toán lại
    if (order.payment_status === "paid") {
      throw new AppError(400, "Order already paid")
    }

    // 5. Kiểm tra Payment đã tồn tại chưa
    const existingPayment = await PaymentRepo.findByOrderId(orderId)

    if (existingPayment && existingPayment.status === "paid") {
      throw new AppError(400, "Order already paid")
    }

    // 6. Tạo requestId
    const requestId = `PAY-${order._id}-${Date.now()}`

    // 7. Tạo Payment
    const payment = await PaymentRepo.create({
      order_id: order._id,
      method: "momo",
      status: "pending",
      request_id: requestId,
    })

    // 8. Gửi request sang MoMo
    const momoResponse = await MomoGateway.createPayment({
      orderId: order.order_code,

      amount: order.total_amount,

      orderInfo: `Thanh toan don hang ${order.order_code}`,

      requestId,
    })

    // 9. MoMo tạo payment thất bại
    if (momoResponse.resultCode !== 0) {
      await PaymentRepo.updateById(payment._id, {
        status: "failed",
      })

      throw new AppError(
        400,
        momoResponse.message || "Cannot create MoMo payment",
      )
    }

    // 10. Trả payUrl cho frontend
    return {
      paymentId: payment._id,
      orderId: order._id,
      payUrl: momoResponse.payUrl,
    }
    // nhiệm vụ là trả payUrl cho fe để khách hàng thanh toán
  }
}

module.exports = new PaymentService()
