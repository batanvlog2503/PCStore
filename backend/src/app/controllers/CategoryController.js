// controllers/CategoryController.js

const CategoryService = require("../services/CategoryService")
class CategoryController {
  async getAllCategories(req, res, next) {
    try {
      const categories = await CategoryService.getAllCategories()
      return res.status(200).json({
        success: true,
        message: "Get All Categories Category successfully !!!",
        categories,
      })
    } catch (err) {
      next(err)
    }
  }
  async getAllTreeCategories(req, res, next) {
    try {
      const categories = await CategoryService.getCategoryTree()
      return res.status(200).json({
        success: true,
        message: "get all tree category successfully!!!",
        categories,
      })
    } catch (err) {
      next(err)
    }
  }

  async getCategoryBySlug(req, res, next) {
    try {
      const category = await CategoryService.getCategoryBySlug(req.params.slug)
      return res.status(200).json({
        success: true,
        message: "get all category by Slug successfully",
        category,
      })
    } catch (err) {
      next(err)
    }
  }

  async createCategory(req, res, next) {
    try {
      const category = await CategoryService.createCategory(req.body)
      return res
        .status(201)
        .json({ success: true, message: "add category successfully", category })
    } catch (err) {
      next(err)
    }
  }

  async updateCategory(req, res, next) {
    try {
      const category = await CategoryService.updateCategory(
        req.params.id,
        req.body,
      )
      return res.status(200).json({
        success: true,
        message: "update category successfully",
        category,
      })
    } catch (err) {
      next(err)
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const result = await CategoryService.deleteCategory(req.params.id)
      return res.status(200).json({ success: true, ...result })
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
