const OrderItemService = require("../services/OrderItemService")

class OrderItemController {
  async getAllOrderItems(req, res, next) {
    try {
      const result = await OrderItemService.getAllOrderItems()

      res.status(200).json({
        success: true,
        message: "Get all order items successfully",
        total: result.total,
        items: result.items,
      })
    } catch (error) {
      next(error)
    }
  }

  async getOrderItemById(req, res, next) {
    try {
      const item = await OrderItemService.getOrderItemById(req.params.id)

      res.status(200).json({
        success: true,
        message: "Get order item successfully",
        item,
      })
    } catch (error) {
      next(error)
    }
  }

  async getOrderItemsByOrder(req, res, next) {
    try {
      const items = await OrderItemService.getOrderItemsByOrder(
        req.params.orderId,
      )

      res.status(200).json({
        success: true,
        message: "Get order items by order successfully",
        total: items.length,
        items,
      })
    } catch (error) {
      next(error)
    }
  }

  async createOrderItem(req, res, next) {
    try {
      const item = await OrderItemService.createOrderItem(req.body)

      res.status(201).json({
        success: true,
        message: "Create order item successfully",
        item,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateOrderItem(req, res, next) {
    try {
      const item = await OrderItemService.updateOrderItem(
        req.params.id,
        req.body,
      )

      res.status(200).json({
        success: true,
        message: "Update order item successfully",
        item,
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteOrderItem(req, res, next) {
    try {
      const result = await OrderItemService.deleteOrderItem(req.params.id)

      res.status(200).json({
        success: true,
        ...result,
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new OrderItemController()
