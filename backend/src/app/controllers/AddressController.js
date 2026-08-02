const AddressService = require("../services/AddressService")

class AddressController {
  async getAllAddresses(req, res) {
    try {
      const addresses = await AddressService.getAllAddresses()
      return res.status(200).json({
        message: "Get all addresses successfully",
        success: true,
        addresses,
      })
    } catch (error) {
      next(error)
    }
  }

  async addAddress(req, res, next) {
    try {
      const address = await AddressService.addAddress(req.user._id, req.body)

      return res.status(201).json({
        success: true,
        message: "Add address successfully",
        address,
      })
    } catch (err) {
      next(err)
    }
  }

  async setDefaultAddress(req, res, next) {
    try {
      const updateAddress = await AddressService.setDefaultAddress(
        req.user._id,
        req.params.id,
      )

      return res.status(200).json({
        success: true,
        message: "Set default address successfully",
        address: updateAddress,
      })
    } catch (err) {
      next(err)
    }
  }

  async deleteAddress(req, res, next) {
    try {
      console.log(req.params)
      const result = await AddressService.deleteAddress(
        req.params.id,
        req.user._id,
      )

      return res.status(200).json({
        success: true,
        ...result,
      })
    } catch (err) {
      next(err)
    }
  }
  async updateAddress(req, res, next) {
    try {
      const address = await AddressService.updateAddress(
        req.user._id,
        req.params.id,
        req.body,
      )

      return res.status(200).json({
        success: true,
        message: "Update address successfully",
        address,
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new AddressController()
