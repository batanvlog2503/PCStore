const VoucherService = require("../services/VoucherService")

class VoucherController {
  async getAll(req, res, next) {
    try {
      const result = await VoucherService.getAll(req)

      return res.status(200).json({
        success: true,

        message: "Lấy danh sách voucher thành công",

        pagination: result.pagination,
        vouchers: result.vouchers,
      })
    } catch (error) {
      next(error)
    }
  }

  async getVoucherById(req, res, next) {
    try {
      const voucher = await VoucherService.getVoucherById(req.params.id)

      res.status(200).json({
        success: true,
        message: "Get voucher successfully",
        voucher,
      })
    } catch (error) {
      next(error)
    }
  }

  async getVoucherByCode(req, res, next) {
    try {
      const voucher = await VoucherService.getVoucherByCode(req.params.code)

      res.status(200).json({
        success: true,
        message: "Get voucher successfully",
        voucher,
      })
    } catch (error) {
      next(error)
    }
  }

  async createVoucher(req, res, next) {
    try {
      const voucher = await VoucherService.createVoucher(req.body)

      return res.status(201).json({
        success: true,
        message: "Create voucher successfully",
        voucher,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateVoucher(req, res, next) {
    try {
      const voucher = await VoucherService.updateVoucher(
        req.params.id,
        req.body,
      )

      res.status(200).json({
        success: true,
        message: "Update voucher successfully",
        voucher,
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteVoucher(req, res, next) {
    try {
      const result = await VoucherService.deleteVoucher(req.params.id)

      res.status(200).json({
        success: true,
        ...result,
      })
    } catch (error) {
      next(error)
    }
  }
  async validateVoucher(req, res, next) {
    try {
      const { code, orderAmount } = req.body /// lấy cide và orderAmount

      const result = await VoucherService.validateVoucher(
        code,
        Number(orderAmount),
      )

      return res.status(200).json({
        success: true,
        message: "Voucher is valid",
        discount: result.discount,
        finalAmount: result.finalAmount,
        voucher: result.voucher,
      })
    } catch (error) {
      next(error)
    }
  }
  async getActiveVouchers(req, res, next) {
    try {
      const vouchers = await VoucherService.getActiveVouchers()

      return res.status(200).json({
        success: true,
        message: "Get active vouchers successfully",
        total: vouchers.length,
        vouchers,
      })
    } catch (error) {
      next(error)
    }
  }

  async claimVoucher(req, res, next) {
    try {
      const userId = req.user._id

      const { voucherId } = req.body

      const result = await VoucherService.claimVoucher(userId, voucherId)

      return res.status(200).json({
        success: true,
        message: "Nhận voucher thành công",

        voucher: result.voucher,

        userVoucher: result.userVoucher,
      })
    } catch (error) {
      next(error)
    }
  }

  //UserVoucherRepo
  // GET /voucher/claimed-ids
  async getClaimedIds(req, res, next) {
    try {
      const userId = req.user._id

      const voucherIds = await VoucherService.getClaimedVoucherIds(userId)

      return res.status(200).json({
        success: true,
        message: "Lấy danh sách voucher đã nhận thành công",
        voucherIds,
      })
    } catch (error) {
      next(error)
    }
  }

  async getMyVouchers(req, res, next) {
    try {
      const userId = req.user._id

      const vouchers = await VoucherService.getMyVouchers(userId)

      return res.status(200).json({
        success: true,
        message: "Lấy voucher của bạn thành công",
        total: vouchers.length,
        vouchers,
      })
    } catch (error) {
      next(error)
    }
  }

  async applyVoucher(req, res, next) {
    try {
      const userId = req.user._id

      const { code, order_total } = req.body
      console.log("CODE:", code)
      console.log("ORDER_TOTAL: ", order_total)
      const data = await VoucherService.applyVoucher(
        userId,
        code,
        Number(order_total),
      )

      return res.status(200).json({
        success: true,
        message: "Áp dụng voucher thành công",
        data,
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new VoucherController()
