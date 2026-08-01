const Address = require("../models/Address")

const AddressRepo = require("../repositories/AddressRepository")
const UserRepo = require("../repositories/UserRepository")
const AppError = require("../utils/AppError")
class AddressService {
  async getAllAddresses() {
    const addresses = await AddressRepo.getAllAddresses()

    return addresses
  }

  async addAddress(userId, data) {
    if (!userId) {
      throw new AppError(400, "User ID is required")
    }
    const count = await AddressRepo.countByUserId(userId)
    if (count >= 5) {
      throw new AppError(400, "You can only add up to 5 addresses")
    }
    if (
      !data.receiver_name ||
      !data.phone ||
      !data.province ||
      !data.district ||
      !data.ward ||
      !data.detail
    ) {
      throw new Error("Missing required fields")
    }

    const user = await UserRepo.findUserById(userId)

    if (!user) {
      throw new AppError(404, "User not found")
    }

    // nếu bạn đã tích vào ô đó hoặc đây là địa chỉ đầu tiên
    const shouldBeDefault = data.is_default === true || count === 0
    if (shouldBeDefault) {
      await AddressRepo.clearDefaultAddress(userId)
    }
    const address = await AddressRepo.addAddress(userId, {
      ...data,
      is_default: shouldBeDefault,
    })

    return address
  }

  async setDefaultAddress(userId, addressId) {
    if (!userId || !addressId) {
      throw new AppError(400, "User ID and Address ID are required")
    }
    const address = await AddressRepo.getAddressesById(addressId)
    if (!address) {
      throw new AppError(404, "Address not found")
    }
    // setup ban đầu thành clear false hết
    await AddressRepo.clearDefaultAddress(userId)
    const updatedAddress = await AddressRepo.setDefaultAddress(
      addressId,
      userId,
    )
    return updatedAddress
  }

  // xóa address

  async deleteAddress(addressId, userId) {
    if (!addressId) {
      throw new AppError(400, "Address ID is required")
    }
    const address = await AddressRepo.getAddressesById(addressId)
    if (!address) {
      throw new AppError(404, "Address not found")
    }

    if (address.user_id.toString() !== userId.toString()) {
      throw new AppError(403, "You are not authorized to delete this address")
    }

    const addresses = await AddressRepo.getAllAddresses()
    if (addresses.length <= 1) {
      throw new AppError(
        400,
        "You must have at least one address, you can't delete this address !",
      )
    }

    const isDefault = address.is_default

    await AddressRepo.deleteAddressById(addressId)
    if (isDefault) {
      // nếu mà true thì set cho thằng đầu tiên còn lại theo thứ tự createdAt
      // nếu xóa địa chỉ mặc định -> set default cho địa chỉ đầu tiên còn lại
      const firstAddress = await AddressRepo.findFirstAddressByUserId(userId)
      if (firstAddress) {
        await AddressRepo.setDefaultAddress(firstAddress._id, userId)
      }
    }
    return { message: "Delete address successfully" }
  }
}

module.exports = new AddressService()
