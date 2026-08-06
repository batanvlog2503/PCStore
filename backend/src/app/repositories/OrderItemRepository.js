const OrderItem = require("../models/OrderItem")

class OrderItemRepository {
  async getAll() {
    return await OrderItem.find()
      .populate("order_id", "order_code")
      .populate("product_id", "name")
      .populate("variant_id", "config_name price")
  }

  async getById(id) {
    return await OrderItem.findById(id)
      .populate("order_id", "order_code")
      .populate("product_id", "name")
      .populate("variant_id", "config_name price")
  }

  async getByOrderId(orderId) {
    return await OrderItem.find({ order_id: orderId })
      .populate("product_id", "name")
      .populate("variant_id", "config_name price")
  }

  async create(data) {
    return await OrderItem.create(data)
  }

  async update(id, data) {
    return await OrderItem.findByIdAndUpdate(id, data, {
      new: true,
    })
  }

  async delete(id) {
    return await OrderItem.findByIdAndDelete(id)
  }

  async deleteManyByOrder(orderId) {
    return await OrderItem.deleteMany({
      order_id: orderId,
    })
  }

  async count() {
    return await OrderItem.countDocuments()
  }
}

module.exports = new OrderItemRepository()
