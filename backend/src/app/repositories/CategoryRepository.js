// repositories/CategoryRepository.js
const Category = require("../models/Category")

class CategoryRepository {
  async getAll() {
    return await Category.find()
  }

  async findById(id) {
    return await Category.findById(id)
  }

  async findBySlug(slug) {
    return await Category.findOne({ slug })
  }

  async create(data) {
    return await Category.create(data)
  }

  async updateById(id, data) {
    return await Category.findByIdAndUpdate(id, data, { new: true })
  }

  async deleteById(id) {
    return await Category.findByIdAndDelete(id)
  }

  // Đếm số danh mục con trực tiếp -> dùng để chặn xoá khi còn con
  async countChildren(id) {
    return await Category.countDocuments({ parent_id: id }) // đếm số luonwcj con
  }
}

module.exports = new CategoryRepository()
