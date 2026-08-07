const VoucherRepo = require("../repositories/VoucherRepository")
const AppError = require("../utils/AppError")

class VoucherService {
  async getAllVouchers(req) {
    return await VoucherRepo.getAll(req)
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
}

module.exports = new VoucherService()
