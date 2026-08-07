    const VoucherService = require("../services/VoucherService")

    class VoucherController {
    async getAllVouchers(req, res, next) {
        try {
        const result = await VoucherService.getAllVouchers(req)

        res.status(200).json({
            success: true,
            message: "Get all vouchers successfully",
            total: result.total,
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

        res.status(201).json({
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
    }

    module.exports = new VoucherController()
