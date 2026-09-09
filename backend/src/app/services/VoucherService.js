const VoucherRepo = require("../repositories/VoucherRepository")
const AppError = require("../utils/AppError")

const UserVoucherRepo = require("../repositories/UserVoucherRepository")
const filterAllVouchers = require("../../helpers/filterAllVouchers")
const sortableVouchers = require("../../helpers/sortableVouchers")
class VoucherService {
  async getAll(req) {
    const filter = filterAllVouchers(req)
    const sort = sortableVouchers(req)
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100)
    const skip = (page - 1) * limit
    const [vouchers, total] = await Promise.all([
      VoucherRepo.getAll(filter, sort, skip, limit),
      VoucherRepo.count(filter),
    ])
    const totalPages = Math.ceil(total / limit)
    return {
      pagination: {
        page,

        limit,

        total,

        totalPages,

        hasNextPage: page < totalPages,

        hasPrevPage: page > 1,
      },
      vouchers,
    }
  }

  async getVoucherById(id) {
    if (!id) {
      throw new AppError(404, "Id is required")
    }
    const voucher = await VoucherRepo.findById(id)

    if (!voucher) {
      throw new AppError(404, "Voucher not found")
    }

    return voucher
  }
  async getMyVouchers(userId) {
    const userVouchers = await UserVoucherRepo.findByUser(userId)

    const vouchers = userVouchers
      .filter((item) => item.voucher_id)
      .map((item) => ({
        _id: item._id,

        status: item.status,

        received_at: item.received_at,

        used_at: item.used_at,

        voucher: item.voucher_id,
      }))

    return vouchers
  }
  async getVoucherByCode(code) {
    if (!code) {
      throw new AppError(404, "Code is required !!!")
    }
    const voucher = await VoucherRepo.findByCode(code)

    if (!voucher) {
      throw new AppError(404, "Voucher not found")
    }

    return voucher
  }

  async createVoucher(data) {
    const exist = await VoucherRepo.findByCode(data.code)

    if (exist) {
      throw new AppError(400, "Voucher code already exists")
    }

    return await VoucherRepo.create(data)
  }

  async updateVoucher(id, data) {
    const voucher = await VoucherRepo.findById(id)

    if (!voucher) {
      throw new AppError(404, "Voucher not found")
    }

    return await VoucherRepo.updateById(id, data)
  }

  async deleteVoucher(id) {
    const voucher = await VoucherRepo.findById(id)

    if (!voucher) {
      throw new AppError(404, "Voucher not found")
    }

    await VoucherRepo.deleteById(id)

    return {
      message: "Delete voucher successfully",
    }
  }

  async validateVoucher(code, orderAmount) {
    if (!code) {
      throw new AppError(400, "Voucher code is required")
    }

    if (!orderAmount || orderAmount <= 0) {
      throw new AppError(400, "Order amount is invalid")
    }
    const voucher = await VoucherRepo.findByCode(code)

    if (!voucher) {
      throw new AppError(404, "Voucher not found")
    }

    if (voucher.status !== "active") {
      throw new AppError(400, "Voucher is not active")
    }

    if (voucher.quantity <= 0) {
      throw new AppError(400, "Voucher has run out")
    }

    const now = new Date()

    if (voucher.start_date > now) {
      throw new AppError(400, "Voucher has not started yet")
    }

    if (voucher.end_date < now) {
      throw new AppError(400, "Voucher has expired")
    }

    if (orderAmount < voucher.min_order_value) {
      throw new AppError(
        400,
        `Minimum order value is ${voucher.min_order_value}`,
      )
    }

    let discount = 0

    if (voucher.discount_type === "percent") {
      discount = (orderAmount * voucher.discount_value) / 100

      if (voucher.max_discount !== null && discount > voucher.max_discount) {
        discount = voucher.max_discount
      }
    } else {
      discount = voucher.discount_value
    }

    const finalAmount = Math.max(orderAmount - discount, 0)

    return {
      voucher,
      discount,
      finalAmount,
    }
  }

  async getActiveVouchers() {
    return await VoucherRepo.getActiveVouchers()
  }

  async claimVoucher(userId, voucherId) {
    if (!userId) {
      throw new AppError(400, "User ID is required")
    }
    if (!voucherId) {
      throw new AppError(400, "Voucher ID is required")
    }
    const existingUserVoucher = await UserVoucherRepo.findByUserAndVoucher(
      userId,
      voucherId,
    )

    if (existingUserVoucher) {
      throw new AppError(400, "Bạn đã nhận voucher này rồi")
    }

    const voucher = await VoucherRepo.findById(voucherId)

    if (!voucher) {
      throw new AppError(404, "Voucher không tồn tại")
    }
    // nhận voucher và kiểm tra và trừ quantity
    const claimedVoucher = await VoucherRepo.claimVoucherAtomic(voucherId)

    if (!claimedVoucher) {
      throw new AppError(
        400,
        "Voucher không còn lượt, chưa đến thời gian sử dụng hoặc đã hết hạn",
      )
    }

    try {
      const userVoucher = await UserVoucherRepo.create({
        user_id: userId,
        voucher_id: voucherId,
        status: "available", // default là available
      })

      return {
        voucher: claimedVoucher,
        userVoucher,
      }
    } catch (error) {
      // ROLLBACK quantity
      await VoucherRepository.increaseQuantity(voucherId)
      // Mongo duplicate key
      if (error.code === 11000) {
        throw new AppError(400, "Bạn đã nhận voucher này rồi")
      }

      throw error
    }
  }

  async getClaimedVoucherIds(userId) {
    const userVouchers = await UserVoucherRepo.getVoucherIdsByUserId(userId)

    const voucherIds = userVouchers.map((item) => item.voucher_id.toString())

    return voucherIds
  }
}

module.exports = new VoucherService()
