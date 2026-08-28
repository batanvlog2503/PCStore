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
    // 5. Kiểm tra Payment đã tồn tại chưa
    const existingPayment = await PaymentRepo.findByOrderId(orderId)

    if (existingPayment?.status === "paid") {
      throw new AppError(400, "Order already paid")
    }

    if (existingPayment?.status === "pending") {
      throw new AppError(
        400,
        "Đã có giao dịch đang xử lý cho đơn này, vui lòng đợi hoặc thử lại sau",
      )
    }

    // 6. Tạo requestId
    const requestId = `PAY-${order._id}-${Date.now()}`

    // 7. Tạo Payment
    const payment = existingPayment
      ? await PaymentRepo.updateById(existingPayment._id, {
          status: "pending",
          request_id: requestId,
        })
      : await PaymentRepo.create({
          order_id: order._id,
          method: "momo",
          status: "pending",
          request_id: requestId,
        })

    // 8. Gửi request sang MoMo
    let momoResponse
    try {
      momoResponse = await MomoGateway.createPayment({
        orderId: order.order_code,
        amount: Math.round(order.total_amount),
        orderInfo: `Thanh toan don hang ${order.order_code}`,
        requestId,
      })

      console.log("===== MOMO RESPONSE =====")
      console.log(momoResponse)
    } catch (err) {
      console.log("===== MOMO ERROR =====")
      console.log("STATUS:", err.response?.status)
      console.log("DATA:", err.response?.data)
      console.log("MESSAGE:", err.message)

      await PaymentRepo.updateById(payment._id, {
        status: "failed",
      })

      throw new AppError(
        500,
        err.response?.data?.message ||
          "Không kết nối được tới cổng thanh toán MoMo",
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
