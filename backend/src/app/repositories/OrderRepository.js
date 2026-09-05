const Order = require("../models/Order")
const filterHelper = require("../../helpers/filterOrder")
const filterMyOrder = require("../../helpers/filterMyOrder")
const OrderItemRepo = require("../repositories/OrderItemRepository")
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
  async getMyOrders(req, userId) {
    const filter = filterMyOrder(req, userId)

    const page = Math.max(Number(req.query.page) || 1, 1)

    const limit = Math.max(Number(req.query.limit) || 4, 1)

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("user_id", "email full_name")
        .populate("address_id"),

      Order.countDocuments(filter),
    ])
    const orderIds = orders.map((o) => o._id)
    const allItems = await OrderItemRepo.findByOrderIds(orderIds)

    const itemsByOrderId = {}
    for (const item of allItems) {
      const key = item.order_id.toString()
      if (!itemsByOrderId[key]) itemsByOrderId[key] = []
      itemsByOrderId[key].push(item)
    }

    const ordersWithItems = orders.map((order) => ({
      ...order.toObject(),
      items: itemsByOrderId[order._id.toString()] || [],
    }))

    return {
      orders: ordersWithItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }
  async findById(id, session = null) {
    return await Order.findById(id)
      .populate("user_id", "email full_name")
      .populate("address_id")
      .session(session)
    //   .populate("voucher_id", "code discount_value")
  }

  async create(data, session) {
    const [order] = await Order.create([data], { session })
    return order
  }

  async updateById(id, data) {
    return await Order.findByIdAndUpdate(id, data, {
      new: true,
    })
  }
  async update(id, data, session = null) {
    return await Order.findByIdAndUpdate(id, data, {
      new: true,
      session,
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

  async updateStatus(id, newStatus) {
    const order = await OrderRepo.findById(id)

    const allowedTransitions = {
      pending: ["shipping", "cancelled"], // được phép chuyển sang
      shipping: ["completed"],
      completed: [],
      cancelled: [],
    }
    const allowedNextStatuses = allowedTransitions[order.status] // trạng thái tiếp theo có thể chuyển

    if (!allowedNextStatuses.includes(newStatus)) {
      // nếu trạng thái newStatus không nằm trong allowedNextStatuses thì error
      throw new AppError(
        400,
        `Cannot change order status from ${order.status} to ${newStatus}`,
      )
    }

    return await OrderRepo.updateById(id, {
      status: newStatus,
    })
  }
}

module.exports = new OrderRepository()
