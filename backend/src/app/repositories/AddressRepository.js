const Address = require("../models/Address")

class AddressRepository {
  async getAllAddresses() {
    return await Address.find()
  }
  async getAddressesById(addressId) {
    return await Address.findById(addressId)
  }
  async addAddress(id, data) {
    return await Address.create({ ...data, user_id: id })
  }
  async findAddressesByUserId(userId) {
    return await Address.find({ user_id: userId })
  }
  async countByUserId(userId) {
    return await Address.countDocuments({
      user_id: userId,
    })
  }
  async updateAddress(addressId, data) {
    return await Address.findByIdAndUpdate(addressId, data, {
      new: true,
      runValidators: true,
    })
  }
  // xóa hết, mặc định là false cho tất cả
  async clearDefaultAddress(userId) {
    return await Address.updateMany(
      { user_id: userId },
      { is_default: false },
      {
        new: true,
      },
    )
  }
  async updateAddress(addressId, data) {
    return await Address.findByIdAndUpdate(addressId, data, {
      new: true,
      runValidators: true,
    })
  }
  async setDefaultAddress(id, userId) {
    return await Address.findOneAndUpdate(
      { _id: id, user_id: userId },
      { is_default: true },
      { new: true },
    )
  }
  async deleteAddressById(id) {
    return await Address.findByIdAndDelete({ _id: id })
  }

  async findFirstAddressByUserId(userId) {
    return await Address.findOne({ user_id: userId }).sort({ createdAt: 1 })
  }
}

module.exports = new AddressRepository()
