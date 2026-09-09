const Voucher = require("../models/Voucher")
const filterVoucher = require("../../helpers/filterVoucher")
const searchVoucher = require("../../helpers/searchVoucher")
class VoucherRepository {
  async getAll(filter, sort, skip, limit) {
    return await Voucher.find(filter).sort(sort).skip(skip).limit(limit).lean()
  }

  async count(filter) {
    return await Voucher.countDocuments(filter)
  }

  async findById(voucherId) {
    return await Voucher.findById(voucherId)
  }

  // Atomic: chỉ giảm quantity khi quantity > 0
  async claimVoucherAtomic(voucherId) {
    const now = new Date()

    return await Voucher.findOneAndUpdate(
      {
        _id: voucherId,
        status: "active",
        quantity: { $gt: 0 },
        start_date: { $lte: now },
        end_date: { $gt: now },
      },
      {
        $inc: {
          quantity: -1,
        },
      },
      {
        new: true,
      },
    )
  }

  // Nếu cần cộng lại quantity khi rollback
  async increaseQuantity(voucherId) {
    return await Voucher.findByIdAndUpdate(
      voucherId,
      {
        $inc: {
          quantity: 1,
        },
      },
      {
        new: true,
      },
    )
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
