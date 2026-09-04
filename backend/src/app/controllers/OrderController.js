const OrderService = require("../services/OrderService")
// Đến khi làm Checkout thì mới sửa lại:

// Không cho gửi user_id.
// Không cho gửi total_amount.
// Không cho gửi order_code.
// Không cho gửi status.
// Không cho gửi payment_status.

// Backend sẽ tự lấy và tự tính các giá trị đó
class OrderController {
  async getAllOrders(req, res, next) {
    try {
      const { orders, total } = await OrderService.getAllOrders(req)

      return res.status(200).json({
        success: true,
        message: "Get all orders successfully",
        total,
        orders,
      })
    } catch (err) {
      next(err)
    }
  }

  async cancelOrder(req, res, next) {
    try {
      const { id } = req.params
      const result = await OrderService.cancelOrder(id)
      return res.status(200).json({ success: true, message: result.message })
    } catch (error) {
      next(error)
    }
  }
  async getMyOrders(req, res, next) {
    try {
      const result = await OrderService.getMyOrders(req, req.user._id)

      return res.status(200).json({
        success: true,
        message: "Get all my orders successfully",
        ...result,
      })
    } catch (err) {
      next(err)
    }
  }
  async getOrderById(req, res, next) {
    try {
      const order = await OrderService.getOrderById(req.params.id)

      return res.status(200).json({
        message: "get Order by id successfully !!!",
        success: true,
        order,
      })
    } catch (err) {
      next(err)
    }
  }

  async createOrder(req, res, next) {
    try {
      const userId = req.user._id
      const result = await OrderService.createOrder(userId, req.body)
      return res.status(201).json({
        success: true,
        message: "Create order successfully",
        order: result,
      })
    } catch (err) {
      next(err)
    }
  }

  async updateOrder(req, res, next) {
    try {
      const order = await OrderService.updateOrder(req.params.id, req.body)

      return res.status(200).json({
        success: true,
        message: "Update order successfully",
        order,
      })
    } catch (err) {
      next(err)
    }
  }

  async deleteOrder(req, res, next) {
    try {
      const result = await OrderService.deleteOrder(req.params.id)

      return res.status(200).json({
        success: true,
        ...result,
      })
    } catch (err) {
      next(err)
    }
  }
  // hủy đơn hàng
  async cancelOrder(req, res, next) {
    try {
      const order = await OrderService.cancelOrder(req.params.id)

      return res.status(200).json({
        success: true,
        message: "Cancel order successfully",
        order,
      })
    } catch (err) {
      next(err)
    }
  }

  // thanh toán

  async updatePaymentStatus(req, res, next) {
    try {
      const order = await OrderService.updatePaymentStatus(req.params.id)

      return res.status(200).json({
        success: true,
        message: "Update payment successfully",
        order,
      })
    } catch (err) {
      next(err)
    }
  }
  // thay đổi trạng thái đơn hàng

  async updateStatus(req, res, next) {
    try {
      const order = await OrderService.updateStatus(
        req.params.id,
        req.body.status,
      )

      return res.status(200).json({
        success: true,
        message: "Update status successfully",
        order,
      })
    } catch (err) {
      next(err)
    }
  }

  async getOrderByOrderCode(req, res, next) {
    try {
      const order = await OrderService.getOrderCode(req.params.code)

      return res.status(200).json({
        success: true,
        message: "get Order By order code",
        order,
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new OrderController()
