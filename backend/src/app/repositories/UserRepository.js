const { findOne } = require("../models/Brand")
const User = require("../models/User")

class UserRepository {
  async findAllUsers() {
    return await User.find({})
  }

  async findUserById(id) {
    return await User.findById(id)
  }

  async createUser(data) {
    return await User.create(data)
  }

  async findByEmail(email) {
    return await User.findOne({ email })
  }

  async updateUser(id, data) {
    return await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
  }
}

module.exports = new UserRepository()
