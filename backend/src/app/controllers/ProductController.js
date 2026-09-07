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
  async adminGetProductDetail(req, res, next) {
    try {
      const { productId } = req.params

      const product = await ProductService.adminGetProductDetail(productId)

      return res.status(200).json({
        success: true,
        message: "Lấy chi tiết sản phẩm thành công",
        data: product,
      })
    } catch (error) {
      next(error)
    }
  }
  async adminGetProducts(req, res, next) {
    try {
      const result = await ProductService.adminGetProducts(req)

      return res.status(200).json({
        success: true,
        message: "Lấy danh sách sản phẩm thành công",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }
  async adminGetProductStats(req, res, next) {
    try {
      const stats = await ProductService.getProductStats(req)

      return res.status(200).json({
        success: true,
        message: "Lấy thống kê sản phẩm thành công",
        data: stats,
      })
    } catch (error) {
      next(error)
    }
  }
  async getProductDetail(req, res, next) {
    try {
      const result = await ProductService.getProductDetail(req.params.productId)

      return res.status(200).json({
        success: true,
        message: "Get all product detail successfully",
        ...result,
      })
    } catch (err) {
      next(err)
    }
  }
  async getIdAndNameProduct(req, res, next) {
    try {
      const products = await ProductService.getIdAndNameProduct()

      return res.status(200).json({
        success: true,
        message: "Get all products successfully",

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

  async softDeleteProduct(req, res, next) {
    try {
      const { id } = req.params

      const result = await ProductService.deleteProduct(id)

      return res.status(200).json({
        success: true,
        message: "Xóa sản phẩm thành công",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async createProduct(req, res, next) {
    try {
      const result = await ProductService.createProduct({
        body: req.body,
        files: req.files,
      })

      return res.status(201).json({
        success: true,
        message: "Tạo sản phẩm thành công",
        data: result,
      })
    } catch (error) {
      console.error("Lỗi tạo sản phẩm:", error)

      return res.status(400).json({
        success: false,
        message: error.message || "Tạo sản phẩm thất bại",
      })
    }
  }
}

module.exports = new ProductController()
