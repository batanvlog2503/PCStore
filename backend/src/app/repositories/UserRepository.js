const filterAllUsers = require("../../helpers/filterAllUsers")
const { findOne } = require("../models/Brand")
const User = require("../models/User")

class UserRepository {
  async findAllUsers() {
    return await User.find({})
  }

  async findUserById(id) {
    return await User.findById(id)
  }

  async findUserByUsername(username) {
    return await User.findOne({ username })
  }

  async createUser(data) {
    return await User.create(data)
  }

  async findByEmail(email) {
    return await User.findOne({ email })
  }
  async findByPhone(phone) {
    return await User.findOne({ phone })
  }

  async updateUser(id, data) {
    return await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
  }

  async filterAllUsers(req) {
    const filter = filterAllUsers(req)

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10

    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({
          created_at: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ])

    return { total, page, limit, totalPages: Math.ceil(total / limit), users }
  }

  async getUserStats() {
    // Thời điểm hiện tại
    const now = new Date()

    // 7 ngày trước
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(now.getDate() - 7)
    const [totalUsers, activeUsers, blockedUsers, newUsers] = await Promise.all(
      [
        // Tổng tất cả khách hàng
        User.countDocuments({
          role: "user",
        }),

        // Tổng đang hoạt động
        User.countDocuments({
          role: "user",
          status: "active",
        }),

        // Tổng bị khóa
        User.countDocuments({
          role: "user",
          status: "blocked",
        }),

        // Khách hàng mới trong 7 ngày gần nhất
        User.countDocuments({
          role: "user",
          created_at: {
            $gte: sevenDaysAgo,
            $lte: now,
          },
        }),
      ],
    )

    return {
      totalUsers,
      activeUsers,
      blockedUsers,
      newUsers,
    }
  }
}

module.exports = new UserRepository()
