const OrderRepo = require("../repositories/OrderRepository")
const UserRepository = require("../repositories/UserRepository")
const AppError = require("../utils/AppError")
const mongoose = require("mongoose")
const CartRepo = require("../repositories/CartRepository")
const ProductImageRepo = require("../repositories/ProductImageRepository")
const OrderItemRepo = require("../repositories/OrderItemRepository")
const CartItemRepo = require("../repositories/CartItemRepository")
const ProductVariantRepo = require("../repositories/ProductVariantRepository")
const Product = require("../models/Product")
const OrderItem = require("../models/OrderItem")
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
    const items = await OrderItemRepo.getByOrderId(id)

    return {
      ...order.toObject(),
      items,
    }
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

    // B5: lấy các id của product [list ProductId]
    const productIds = items.map((item) => item.variant_id.product_id._id)

    const productImages =
      await ProductImageRepo.findMainImagesByProductIds(productIds)

    // Tạo Map:
    //
    // productId -> image_url
    //

    const imageMap = new Map(
      productImages.map((image) => [
        image.product_id.toString(),
        image.image_url,
      ]),
    )

    // B6: Start Transaction bắt đầu khởi tạo

    const session = await mongoose.startSession()

    try {
      session.startTransaction()
      // B7. Tạo Order
      const order = await OrderRepo.create(
        {
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

          note: note || null,
        },
        session,
      )
      // B8. Tạo OrderItem
      const orderItems = items.map((item) => {
        const variant = item.variant_id
        const product = variant.product_id

        const productImage = imageMap.get(product._id.toString())

        return {
          order_id: order._id,

          product_id: product._id,
          variant_id: variant._id,

          // SNAPSHOT
          product_name: product.name,
          product_image: productImage || null,

          sku: variant.sku,
          config_name: variant.config_name || null,

          price: variant.price,
          discount_price: variant.discount_price,

          quantity: item.quantity,

          subtotal: variant.discount_price * item.quantity,
        }
      })

      await OrderItemRepo.createMany(orderItems, session)

      // B9. Trừ Stock
      for (const item of items) {
        const variant = item.variant_id

        const result = await ProductVariantRepo.decreaseStock(
          variant._id,
          item.quantity,
          session,
        )
        if (result.modifiedCount !== 1) {
          // ===1 có nghĩa là đã thay đổi stock
          throw new AppError(400, `${variant.sku} is out of stock`)
        }
      }
      // B10. Xóa CartItem
      await CartItemRepo.deleteManyByIds(cart_item_ids, session)
      // B11. COMMIT
      await session.commitTransaction()
      // B12. Trả Order
      return order
    } catch (error) {
      // Có lỗi → ROLLBACK
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
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
  async updateOrderStatus(id, status) {
    if (!id) {
      throw new AppError(400, "id not found")
    }

    if (!status) {
      throw new AppError(400, "Status not found")
    }

    const allowedStatus = [
      "pending",
      "confirmed",
      "shipping",
      "completed",
      "cancelled",
    ]

    if (!allowedStatus.includes(status)) {
      throw new AppError(400, "Status is wrong value !!!")
    }

    // Lấy đơn hàng hiện tại
    const order = await OrderRepo.findById(id)

    if (!order) {
      throw new AppError(404, "Order not found")
    }
    const oldStatus = order.status

    if (oldStatus === "completed" && status !== "completed") {
      throw new AppError(
        400,
        "Đơn hàng đã hoàn thành không thể thay đổi trạng thái",
      )
    }
    const updateData = {
      status,
    }
    if (status === "completed") {
      updateData.completed_at = new Date()
      updateData.cancelled_at = null
    }
    if (status === "cancelled") {
      updateData.cancelled_at = new Date()
      updateData.completed_at = null
    }

    if (["pending", "confirmed", "shipping"].includes(status)) {
      updateData.completed_at = null
      updateData.cancelled_at = null
    }

    // =========================
    // NẾU COMPLETED VÀ CHƯA CỘNG SOLD
    // =========================

    if (status === "completed" && oldStatus !== "completed") {
      const orderItems = await OrderItem.find({
        order_id: order._id,
      }).lean()

      for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.product_id, {
          $inc: {
            sold_count: item.quantity,
          },
        })
      }
    }

    return await OrderRepo.updateById(id, updateData)
  }
  async getMyOrders(req, userId) {
    if (!userId) {
      throw new AppError(404, "User Id is required")
    }

    const user = await UserRepository.findUserById(userId)

    if (!user) {
      throw new AppError(404, "User not found")
    }

    return await OrderRepo.getMyOrders(req, userId)
  }
  // change status from completed to cancelled
  async cancelOrder(id) {
    const session = await mongoose.startSession()

    try {
      session.startTransaction()

      const order = await OrderRepo.findById(id, session)

      if (!order) {
        throw new AppError(404, "Order not found")
      }

      if (order.status !== "pending") {
        throw new AppError(400, "Chỉ có thể hủy đơn đang chờ xác nhận")
      }

      const orderItems = await OrderItemRepo.getByOrderId(id)

      for (const item of orderItems) {
        await ProductVariantRepo.increaseStock(
          item.variant_id._id,
          item.quantity,
          session,
        )
      }

      await OrderRepo.update(id, { status: "cancelled" }, session)

      await session.commitTransaction()

      return {
        message: "Hủy đơn hàng thành công",
      }
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }
  async updatePaymentStatus(id) {
    const order = await OrderRepo.findById(id)

    if (!order) {
      throw new AppError(404, "Order not found")
    }
    if (order.status === "cancelled") {
      throw new AppError(400, "Cancelled order cann ot be paid")
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
