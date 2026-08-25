const OrderRepo = require("../repositories/OrderRepository")
const UserRepository = require("../repositories/UserRepository")
const AppError = require("../utils/AppError")
const CartRepo = require("../repositories/CartRepository")
const OrderItemRepo = require("../repositories/OrderItemRepository")
const CartItemRepo = require("../repositories/CartItemRepository")
const ProductVariantRepo = require("../repositories/ProductVariantRepository")
const validateStock = (items) => {
  for (const item of items) {
    const variant = item.variant_id // đã populate

    if (!variant) {
      throw new AppError(404, "Variant not found")
    }

    if (variant.status !== "active") {
      throw new AppError(400, `${variant.sku} is discontinued`)
    }

    if (item.quantity > variant.stock) {
      throw new AppError(400, `${variant.sku} is out of stock`)
    }
  }
}

const validateCartItems = (items, cartItemIds) => {
  if (!items.length) {
    throw new AppError(404, "Cart items not found")
  }

  if (items.length !== cartItemIds.length) {
    throw new AppError(400, "Some cart items are invalid")
  }
}
const calculateOrderAmount = (items) => {
  const subtotal = items.reduce((total, item) => {
    return total + item.variant_id.price * item.quantity
  }, 0)

  const product_discount = items.reduce((total, item) => {
    const discount = item.variant_id.price - item.variant_id.discount_price

    return total + Math.max(0, discount) * item.quantity
  }, 0)

  const voucher_discount = 0
  const shipping_fee = 0

  const total_amount =
    subtotal - product_discount - voucher_discount + shipping_fee

  return {
    subtotal,
    product_discount,
    voucher_discount,
    shipping_fee,
    total_amount,
  }
}

const generateOrderCode = () => {
  return `ORD-${Date.now()}`
}
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
  // old createOrder
  // async createOrder(data) {
  //   const exist = await OrderRepo.findByOrderCode(data.order_code)

  //   if (exist) {
  //     throw new AppError(400, "Order code already exists")
  //   }

  //   return await OrderRepo.create(data)
  // }
  // new CreateOrder

  async createOrder(userId, data) {
    // tại sao phải có userId đơn giản để lấy cartItem của người đó
    const { cart_item_ids, address_id, payment_method, note } = data

    // lấy cart của user thông qua userId
    //B1: Timf cart thogn qua userId
    const cart = await CartRepo.findByUserId(userId)

    if (!cart) {
      throw new AppError(404, "Cart not found")
    }

    // lấy những item chuẩn đã lấy và chuẩn bị đưa vào order
    const items = await CartItemRepo.findByIdsAndCart(cart_item_ids, cart._id)
    //B2: Check CartItem
    // kiểm tra xem có items nào không
    validateCartItems(items, cart_item_ids)
    // kiểm tra giỏ hàng xem quantity của item  > stock không
    //B3: Check Stock
    validateStock(items)

    // tinhs tien
    //B4: tinh tong tien, tinh tien giam gia
    const amount = calculateOrderAmount(items)

    // B5: tao order voi cac field trong order model
    const order = await OrderRepo.create({
      user_id: userId,
      address_id,
      order_code: generateOrderCode(),

      subtotal: amount.subtotal,
      product_discount: amount.product_discount,
      voucher_discount: amount.voucher_discount,
      shipping_fee: amount.shipping_fee,
      total_amount: amount.total_amount,

      payment_method,
      payment_status: "pending",
      status: "pending",

      note,
    })
    // B6: tao orderItem [list]
    const orderItems = items.map((item) => {
      const variant = item.variant_id

      return {
        order_id: order._id,
        variant_id: variant._id,
        product_id: variant.product_id, // thêm dòng này
        sku: variant.sku,
        config_name: variant.config_name,

        price: variant.price,
        discount_price: variant.discount_price,

        quantity: item.quantity,

        subtotal: variant.discount_price * item.quantity,
      }
    })

    await OrderItemRepo.createMany(orderItems)

    // b7: tru stock cua productVariantRepo

    for (const item of items) {
      const variant = item.variant_id

      await ProductVariantRepo.decreaseStock(variant._id, item.quantity)
    }

    // b8: sau khi da tru stock nghia la đã mua
    // thì xóa cartItem đã selected

    await CartItemRepo.deleteManyByIds(cart_item_ids)

    // b9 trả về order đã tạo

    return order
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
