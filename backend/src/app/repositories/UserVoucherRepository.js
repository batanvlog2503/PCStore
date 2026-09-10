const UserVoucher = require("../models/UserVoucher")

class UserVoucherRepository {
  async findByUserAndVoucher(userId, voucherId) {
    return await UserVoucher.findOne({
      user_id: userId,
      voucher_id: voucherId,
    })
  }
  async findUserVoucherByIdAndUser(userVoucherId, userId) {
    return await UserVoucher.findOne({
      _id: userVoucherId,
      user_id: userId,
    })
  }
  async create(data) {
    return await UserVoucher.create(data)
  }

  async findByUser(userId) {
    return await UserVoucher.find({
      user_id: userId,
      status: "available",
    })
      .populate("voucher_id")
      .sort({
        received_at: -1,
      })
  }

  async getVoucherIdsByUserId(userId) {
    return await UserVoucher.find({
      user_id: userId,
    })
      .select("voucher_id -_id")
      .lean()
  }
}

module.exports = new UserVoucherRepository()
