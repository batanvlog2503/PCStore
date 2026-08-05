const Brand = require("../models/Brand")

class BrandRepository {
  async getAll() {
    return await Brand.find().lean()
  }

  async findByName(name) {
    return await Brand.findOne({ name })
  }
  async findById(id) {
    return await Brand.findById(id)
  }

  async create(data) {
    return await Brand.create(data)
  }

  async updateById(id, data) {
    return await Brand.findByIdAndUpdate(id, data, { new: true })
  }

  async deleteById(id) {
    return await Brand.findByIdAndDelete(id)
  }
}

module.exports = new BrandRepository()
