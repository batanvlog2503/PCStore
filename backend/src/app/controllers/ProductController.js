const ProductService = require("../services/ProductService")
const search = require("../../helpers/search")
class ProductController {
  async getAllProducts(req, res, next) {
    try {
      const { products, total } = await ProductService.getAllProducts(req)

      return res.status(200).json({
        success: true,
        message: "Get all products successfully",
        total,
        products,
      })
    } catch (err) {
      next(err)
    }
  }
  async getBestSeller(req, res, next) {
    try {
      const products = await ProductService.getBestSeller()

      return res.status(200).json({
        success: true,
        message: "Get best seller products successfully",
        total: products.length,
        products,
      })
    } catch (err) {
      next(err)
    }
  }
  async getProductBySlug(req, res, next) {
    try {
      const product = await ProductService.getProductBySlug(req.params.slug)

      return res.status(200).json({
        success: true,
        message: "get Product By Slug Successfully !!!",
        product,
      })
    } catch (err) {
      next(err)
    }
  }

  async createProduct(req, res, next) {
    try {
      const product = await ProductService.createProduct(req.body)

      res.status(201).json({
        success: true,
        message: "Create product successfully",
        product,
      })
    } catch (err) {
      next(err)
    }
  }

  async updateProduct(req, res, next) {
    try {
      const product = await ProductService.updateProduct(
        req.params.id,
        req.body,
      )

      res.status(200).json({
        success: true,
        message: "Update product successfully",
        product,
      })
    } catch (err) {
      next(err)
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const result = await ProductService.deleteProduct(req.params.id)

      res.status(200).json({
        success: true,
        ...result,
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new ProductController()
