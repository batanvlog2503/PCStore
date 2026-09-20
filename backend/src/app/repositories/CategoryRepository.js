// repositories/CategoryRepository.js
const Category = require("../models/Category")

class CategoryRepository {
  async getAll() {
    return await Category.find().lean()
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

  // CategoryRepository.js — thêm
  async getAllPaginated(filter, skip, limit) {
    return await Category.find(filter)
      .populate("parent_id", "name")
      .sort({ parent_id: 1, name: 1 }) // cha (null) đứng trước con cùng nhóm
      .skip(skip)
      .limit(limit)
  }

  async countByFilter(filter) {
    return await Category.countDocuments(filter)
  }

  async getStats() {
    const total = await Category.countDocuments()
    const parents = await Category.countDocuments({ parent_id: null })
    return { total, parents, children: total - parents }
  }

  async getRootCategories() {
    return await Category.find({ parent_id: null }).select("_id name")
  }
}

module.exports = new CategoryRepository()
