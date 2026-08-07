const Voucher = require("../models/Voucher")
const filterVoucher = require("../../helpers/filterVoucher")
const searchVoucher = require("../../helpers/searchVoucher")
class VoucherRepository {
  async getAll(req) {
    const filter = filterVoucher(req)
    const search = searchVoucher(req)

    const query = {
      ...filter,
      ...search,
    }

    const [vouchers, total] = await Promise.all([
      Voucher.find(query),
      Voucher.countDocuments(query),
    ])

    return { vouchers, total }
  }

  async findById(id) {
    return await Voucher.findById(id)
  }

  async findByCode(code) {
    return await Voucher.findOne({ code })
  }

  async create(data) {
    return await Voucher.create(data)
  }

  async updateById(id, data) {
    return await Voucher.findByIdAndUpdate(id, data, {
      new: true,
    })
  }

  async deleteById(id) {
    return await Voucher.findByIdAndDelete(id)
  }
  async getActiveVouchers() {
    const now = new Date()

    return await Voucher.find({
      status: "active",
      quantity: { $gt: 0 },
      start_date: { $lte: now },
      end_date: { $gte: now },
    })
  }
}

module.exports = new VoucherRepository()
