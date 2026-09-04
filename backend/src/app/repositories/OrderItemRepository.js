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
      .populate("variant_id")
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

  async createMany(data, session) {
    return await OrderItem.insertMany(data, { session })
  }

  // Lấy TẤT CẢ items thuộc nhiều order cùng lúc (dùng cho danh sách nhiều đơn)
  async findByOrderIds(orderIds) {
    return await OrderItem.find({ order_id: { $in: orderIds } })
  }
  // khi xóa order thì tất cả các orderItem cũng xóa theo
  async deleteByOrderId(orderId) {
    return await OrderItem.deleteMany({
      order_id: orderId,
    })
  }
}

module.exports = new OrderItemRepository()
