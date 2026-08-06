const OrderRepo = require("../repositories/OrderRepository")
const UserRepository = require("../repositories/UserRepository")
const AppError = require("../utils/AppError")

class OrderService {
  async getAllOrders(req) {
    return await OrderRepo.getAll(req)
  }

  async getOrderById(id) {
    const order = await OrderRepo.findById(id)

    if (!order) {
      throw new AppError(404, "Order not found")
    }

    return order
  }

  async createOrder(data) {
    const exist = await OrderRepo.findByOrderCode(data.order_code)

    if (exist) {
      throw new AppError(400, "Order code already exists")
    }

    return await OrderRepo.create(data)
  }

  async getOrderCode(orderCode) {
    if (!orderCode) {
      throw new AppError(404, "Order Code is required")
    }

    const order = await OrderRepo.findByOrderCode(orderCode)

    if (!order) {
      throw new AppError(404, "Order not found")
    }

    return order
  }
  async updateOrder(id, data) {
    const order = await OrderRepo.findById(id)

    if (!order) {
      throw new AppError(404, "Order not found")
    }

    return await OrderRepo.updateById(id, data)
  }

  async deleteOrder(id) {
    const order = await OrderRepo.findById(id)

    if (!order) {
      throw new AppError(404, "Order not found")
    }

    await OrderRepo.deleteById(id)

    return {
      message: "Delete order successfully",
    }
  }

  async getMyOrders(userId) {
    if (!userId) {
      throw new AppError(404, "User Id is required")
    }

    const user = await UserRepository.findUserById(userId)

    if (!user) {
      throw new AppError(404, "User not found")
    }

    return await OrderRepo.getMyOrders(userId)
  }
  // change status from completed to cancelled
  async cancelOrder(id) {
    const order = await OrderRepo.findById(id)

    if (!order) {
      throw new AppError(404, "Order not found")
    }

    if (order.status === "completed") {
      throw new AppError(400, "Completed order cannot be cancelled")
    }

    return await OrderRepo.updateById(id, {
      status: "cancelled",
    })
  }
  async updatePaymentStatus(id) {
    const order = await OrderRepo.findById(id)

    if (!order) {
      throw new AppError(404, "Order not found")
    }
    if (order.status === "cancelled") {
      throw new AppError(400, "Cancelled order cannot be paid")
    }
    if (order.payment_status === "paid") {
      throw new AppError(400, "Order already paid")
    }

    return await OrderRepo.updateById(id, {
      payment_status: "paid",
    })
  }

  // thay đổi trạng thái đơn hàng status

  async updateStatus(id, status) {
    const order = await OrderRepo.findById(id)

    if (!order) {
      throw new AppError(404, "Order not found")
    }

    const validStatus = ["pending", "shipping", "completed", "cancelled"]

    if (!validStatus.includes(status)) {
      throw new AppError(400, "Invalid status")
    }

    return await OrderRepo.updateById(id, {
      status,
    })
  }
}

module.exports = new OrderService()
