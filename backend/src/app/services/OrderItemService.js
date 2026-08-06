const AppError = require("../utils/AppError")
const OrderItemRepo = require("../repositories/OrderItemRepository")
const ProductVariantRepo = require("../repositories/ProductVariantRepository")
const OrderRepo = require("../repositories/OrderRepository")

class OrderItemService {
  async getAllOrderItems() {
    const [items, total] = await Promise.all([
      OrderItemRepo.getAll(),
      OrderItemRepo.count(),
    ])

    return {
      items,
      total,
    }
  }

  async getOrderItemById(id) {
    const item = await OrderItemRepo.getById(id)

    if (!item) {
      throw new AppError(404, "Order Item not found")
    }

    return item
  }

  async getOrderItemsByOrder(orderId) {
    return await OrderItemRepo.getByOrderId(orderId)
  }

  async createOrderItem(data) {
    const order = await OrderRepo.findById(data.order_id)

    if (!order) {
      throw new AppError(404, "Order not found")
    }

    const variant = await ProductVariantRepo.findById(data.variant_id)

    if (!variant) {
      throw new AppError(404, "Variant not found")
    }

    if (variant.product_id.toString() !== data.product_id.toString()) {
      throw new AppError(400, "Variant does not belong to this product")
    }

    return await OrderItemRepo.create(data)
  }

  async updateOrderItem(id, data) {
    const item = await OrderItemRepo.getById(id)

    if (!item) {
      throw new AppError(404, "Order Item not found")
    }

    return await OrderItemRepo.update(id, data)
  }

  async deleteOrderItem(id) {
    const item = await OrderItemRepo.getById(id)

    if (!item) {
      throw new AppError(404, "Order Item not found")
    }

    await OrderItemRepo.delete(id)

    return {
      message: "Delete Order Item successfully",
    }
  }
}

module.exports = new OrderItemService()
