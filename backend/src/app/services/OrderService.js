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
const ProductVariant = require("../models/ProductVariant")
const OrderItem = require("../models/OrderItem")
const VoucherRepo = require("../repositories/VoucherRepository")
const User = require("../models/User")
const filterAllOrders = require("../../helpers/filterAllOrders")
const UserVoucherRepo = require("../repositories/UserVoucherRepository")
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
const generateOrderCode = () => {
  return `DH${Date.now()}`
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
    const price = item.variant_id.price
    const discountPrice = item.variant_id.discount_price ?? price // fallback nếu null/undefined
    const discount = price - discountPrice

    return total + Math.max(0, discount) * item.quantity
  }, 0)

  return { subtotal, product_discount }
}

const calculateProductVoucherDiscount = (voucher, orderTotal) => {
  const now = new Date()

  // Check thời gian
  if (voucher.start_date && new Date(voucher.start_date) > now) {
    throw new AppError(400, "Voucher chưa đến thời gian sử dụng")
  }

  if (voucher.end_date && new Date(voucher.end_date) < now) {
    throw new AppError(400, "Voucher đã hết hạn")
  }

  // Check trạng thái
  if (voucher.status !== "active") {
    throw new AppError(400, "Voucher không còn khả dụng")
  }

  // Check đúng loại voucher
  if (voucher.voucher_type !== "product") {
    throw new AppError(400, "Voucher không phải loại giảm sản phẩm")
  }

  // Check đơn tối thiểu
  const minOrderValue = Number(voucher.min_order_value || 0)

  if (Number(orderTotal) < minOrderValue) {
    throw new AppError(
      400,
      `Đơn hàng phải từ ${minOrderValue.toLocaleString("vi-VN")}đ`,
    )
  }

  let discountAmount = 0

  // Giảm %
  if (voucher.discount_type === "percent") {
    discountAmount = (Number(orderTotal) * Number(voucher.discount_value)) / 100

    if (voucher.max_discount && discountAmount > Number(voucher.max_discount)) {
      discountAmount = Number(voucher.max_discount)
    }
  }

  // Giảm tiền cố định
  if (voucher.discount_type === "fixed") {
    discountAmount = Number(voucher.discount_value)
  }

  // Không giảm quá tiền sản phẩm
  return Math.min(discountAmount, Number(orderTotal))
}

const calculateShippingVoucherDiscount = (voucher, orderTotal, shippingFee) => {
  const now = new Date()

  // Check thời gian
  if (voucher.start_date && new Date(voucher.start_date) > now) {
    throw new AppError(400, "Voucher chưa đến thời gian sử dụng")
  }

  if (voucher.end_date && new Date(voucher.end_date) < now) {
    throw new AppError(400, "Voucher đã hết hạn")
  }

  // Check trạng thái
  if (voucher.status !== "active") {
    throw new AppError(400, "Voucher không còn khả dụng")
  }

  // Check đúng loại
  if (voucher.voucher_type !== "shipping") {
    throw new AppError(400, "Voucher không phải loại vận chuyển")
  }

  // Check đơn hàng tối thiểu
  const minOrderValue = Number(voucher.min_order_value || 0)

  if (Number(orderTotal) < minOrderValue) {
    throw new AppError(
      400,
      `Đơn hàng phải từ ${minOrderValue.toLocaleString("vi-VN")}đ`,
    )
  }

  let discountAmount = 0

  // Voucher % phí ship
  if (voucher.discount_type === "percent") {
    discountAmount =
      (Number(shippingFee) * Number(voucher.discount_value)) / 100

    if (voucher.max_discount && discountAmount > Number(voucher.max_discount)) {
      discountAmount = Number(voucher.max_discount)
    }
  }

  // Voucher freeship / giảm số tiền cố định
  if (voucher.discount_type === "fixed") {
    discountAmount = Number(voucher.discount_value)
  }

  // Không được giảm quá phí ship
  return Math.min(discountAmount, Number(shippingFee))
}
class OrderService {
  // async getAllOrders(req) {
  //   return await OrderRepo.getAll(req)
  // }
  async getAllOrders(req) {
    const { search, page = 1, limit = 10 } = req.query

    const currentPage = Number(page)
    const currentLimit = Number(limit)

    const skip = (currentPage - 1) * currentLimit
    const filter = filterAllOrders(req)

    if (search) {
      const keyword = search.trim()

      // Tìm user theo username/email/phone
      const users = await User.find({
        $or: [
          {
            username: {
              $regex: keyword,
              $options: "i",
            },
          },
          {
            email: {
              $regex: keyword,
              $options: "i",
            },
          },
          {
            phone: {
              $regex: keyword,
              $options: "i",
            },
          },
        ],
      }).select("_id")

      const userIds = users.map((user) => user._id)

      // Search order_code HOẶC user_id
      filter.$or = [
        {
          order_code: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          user_id: {
            $in: userIds, // lọc những đơn hàng của userId đó đã
          },
        },
      ]
    }

    const [orders, total] = await Promise.all([
      OrderRepo.findAll(filter, skip, currentLimit),

      OrderRepo.countDocuments(filter),
    ])

    const stats = await OrderRepo.getOrderStats()

    return {
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.ceil(total / currentLimit),
      stats,
      orders,
    }
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

  async createOrder(userId, data) {
    // tại sao phải có userId đơn giản để lấy cartItem của người đó
    const {
      cart_item_ids,
      address_id,
      payment_method,
      note,
      product_user_voucher_id,
      shipping_user_voucher_id,
    } = data
    // Chặn trường hợp FE/lỗi gửi trùng 1 voucher cho cả 2 vai trò
    if (
      product_user_voucher_id &&
      shipping_user_voucher_id &&
      String(product_user_voucher_id) === String(shipping_user_voucher_id)
    ) {
      throw new AppError(400, "Không thể dùng cùng một voucher cho cả 2 mục")
    }
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
    // Phí ship khai báo riêng ở đây (tạm thời = 0, sau này có thể tính theo địa chỉ/khối lượng...)
    const shippingFee = 20000
    // Tổng tiền dùng để xét voucher
    // lấy tổng tiền không khuyến mãi - tổng số tiền giảm giá khuyễn mãi chưa voucher

    const orderTotalForVoucher = amount.subtotal - amount.product_discount
    // B5: Xử lý Voucher

    let productVoucherDiscount = 0
    let shippingVoucherDiscount = 0

    let productUserVoucher = null
    let shippingUserVoucher = null
    let productVoucher = null
    let shippingVoucher = null

    // ---------- PRODUCT VOUCHER ----------
    if (product_user_voucher_id) {
      productUserVoucher = await UserVoucherRepo.findUserVoucherByIdAndUser(
        product_user_voucher_id,
        userId,
      )

      if (!productUserVoucher) {
        throw new AppError(400, "Voucher giảm giá sản phẩm không hợp lệ")
      }

      if (productUserVoucher.status !== "available") {
        throw new AppError(400, "Voucher giảm giá sản phẩm đã được sử dụng")
      }

      productVoucher = await VoucherRepo.findById(productUserVoucher.voucher_id)

      if (!productVoucher) {
        throw new AppError(404, "Voucher không tồn tại")
      }

      if (productVoucher.voucher_type === "shipping") {
        throw new AppError(400, "Voucher này không phải voucher giảm sản phẩm")
      }

      productVoucherDiscount = calculateProductVoucherDiscount(
        productVoucher,
        orderTotalForVoucher,
      )
    }

    // ---------- SHIPPING VOUCHER ----------
    if (shipping_user_voucher_id) {
      shippingUserVoucher = await UserVoucherRepo.findUserVoucherByIdAndUser(
        shipping_user_voucher_id,
        userId,
      )

      if (!shippingUserVoucher) {
        throw new AppError(400, "Voucher vận chuyển không hợp lệ")
      }

      if (shippingUserVoucher.status !== "available") {
        throw new AppError(400, "Voucher vận chuyển đã được sử dụng")
      }

      shippingVoucher = await VoucherRepo.findById(
        shippingUserVoucher.voucher_id,
      )

      if (!shippingVoucher) {
        throw new AppError(404, "Voucher không tồn tại")
      }

      if (shippingVoucher.voucher_type !== "shipping") {
        throw new AppError(400, "Voucher này không phải voucher vận chuyển")
      }

      shippingVoucherDiscount = calculateShippingVoucherDiscount(
        shippingVoucher,
        orderTotalForVoucher,
        shippingFee,
      )
    }

    // Tổng voucher giảm
    const voucherDiscount = productVoucherDiscount + shippingVoucherDiscount

    // Tổng tiền cuối
    const totalAmount = Math.max(
      0,
      amount.subtotal - amount.product_discount - voucherDiscount + shippingFee,
    )
    // B5: lấy các id của product [list ProductId]

    const productIds = items.map((item) => item.variant_id.product_id._id)

    const productImages =
      await ProductImageRepo.findMainImagesByProductIds(productIds)

    // Tạo Map:
    // productId -> image_url

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

          // Giảm giá sản phẩm có sẵn
          product_discount: amount.product_discount,

          // Tổng tiền giảm từ tất cả voucher
          voucher_discount: voucherDiscount,
          product_user_voucher_id: productUserVoucher
            ? productUserVoucher._id
            : null,
          product_voucher_discount: productVoucherDiscount,
          product_voucher_code: productVoucher?.code || null,

          shipping_user_voucher_id: shippingUserVoucher
            ? shippingUserVoucher._id
            : null,
          shipping_voucher_discount: shippingVoucherDiscount,
          shipping_voucher_code: shippingVoucher?.code || null,

          shipping_fee: shippingFee,
          total_amount: totalAmount,
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

        const finalPrice = variant.discount_price ?? variant.price

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
          discount_price: variant.discount_price ?? null,

          quantity: item.quantity,

          subtotal: finalPrice * item.quantity,
        }
      })

      await OrderItemRepo.createMany(orderItems, session)

      // B10: Đánh dấu Voucher đã dùng

      if (productUserVoucher) {
        await VoucherRepo.markUserVoucherAsUsed(productUserVoucher._id, session)
      }

      if (shippingUserVoucher) {
        await VoucherRepo.markUserVoucherAsUsed(
          shippingUserVoucher._id,
          session,
        )
      }
      // B11. Trừ Stock
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

    const orderItems = await OrderItem.find({
      order_id: order._id,
    }).lean()

    // COMPLETED
    // CHỈ TĂNG SOLD_COUNT
    // KHÔNG TRỪ STOCK

    if (status === "completed" && oldStatus !== "completed") {
      for (const item of orderItems) {
        await Product.findByIdAndUpdate(item.product_id, {
          $inc: {
            sold_count: item.quantity,
          },
        })
      }
    }

    // CANCELLED
    // HOÀN LẠI STOCK
    if (status === "cancelled" && oldStatus !== "cancelled") {
      for (const item of orderItems) {
        if (item.variant_id) {
          await ProductVariant.findByIdAndUpdate(item.variant_id, {
            $inc: {
              stock: item.quantity,
            },
          })
        }
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

  // admin
}

module.exports = new OrderService()
