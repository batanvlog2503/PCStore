// controllers/CategoryController.js

const CategoryService = require("../services/CategoryService")
class CategoryController {
  async getAllCategories(req, res, next) {
    try {
      const data = await CategoryService.getCategoryTree()
      res.status(200).json({ success: true, data })
    } catch (err) {
      next(err)
    }
  }

  async getCategoryBySlug(req, res, next) {
    try {
      const data = await CategoryService.getCategoryBySlug(req.params.slug)
      res.status(200).json({ success: true, data })
    } catch (err) {
      next(err)
    }
  }

  async createCategory(req, res, next) {
    try {
      const data = await CategoryService.createCategory(req.body)
      res.status(201).json({ success: true, data })
    } catch (err) {
      next(err)
    }
  }

  async updateCategory(req, res, next) {
    try {
      const data = await CategoryService.updateCategory(req.params.id, req.body)
      res.status(200).json({ success: true, data })
    } catch (err) {
      next(err)
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const result = await CategoryService.deleteCategory(req.params.id)
      res.status(200).json({ success: true, ...result })
    } catch (err) {
      next(err)
    }
  }

  async test(req, res, next) {
    try {
      return res.send("Category route is working")
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new CategoryController()

// đã add
// ├── Laptop Gaming
// └── Laptop Văn phòng

// Linh kiện
// ├── CPU
// ├── RAM
// ├── SSD
// ├── Mainboard
// └── Card màn hình

// PC Gaming
// ├── PC Gaming Intel
// └── PC Gaming AMD
