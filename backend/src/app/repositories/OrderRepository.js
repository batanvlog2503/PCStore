const Order = require("../models/Order")
const filterHelper = require("../../helpers/filterOrder")
class OrderRepository {
  async getAll(req) {
    const filter = filterHelper(req)
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user_id", "email full_name")
        .populate("address_id"),
      // .populate("voucher_id", "code discount_value"),
      Order.countDocuments(filter),
    ])

    return {
      orders,
      total,
    }
  }
  async getMyOrders(userId) {
    const [orders, total] = await Promise.all([
      Order.find({ user_id: userId })
        .populate("user_id", "email full_name")
        .populate("address_id"),
      // .populate("voucher_id", "code discount_value"),
      Order.countDocuments({ user_id: userId }),
    ])

    return {
      orders,
      total,
    }
  }
  async findById(id) {
    return await Order.findById(id)
      .populate("user_id", "email full_name")
      .populate("address_id")
    //   .populate("voucher_id", "code discount_value")
  }

  async create(data) {
    return await Order.create(data)
  }

  async updateById(id, data) {
    return await Order.findByIdAndUpdate(id, data, {
      new: true,
    })
  }

  async deleteById(id) {
    return await Order.findByIdAndDelete(id)
  }

  async findByOrderCode(orderCode) {
    return await Order.findOne({
      order_code: orderCode,
    })
  }
}

module.exports = new OrderRepository()
