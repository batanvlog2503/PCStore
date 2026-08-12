const ProductVariantService = require("../services/ProductVariantService")
const { validationResult } = require("express-validator")

class ProductVariantController {
  async getAllVariants(req, res, next) {
    try {
      const variants = await ProductVariantService.getAllVariants()

      return res.status(200).json({
        success: true,
        message: "get all variants successfully !!!",
        ...variants,
      })
    } catch (err) {
      next(err)
    }
  }
  async getAllId(req, res, next) {
    try {
      const variants = await ProductVariantService.getAllId()

      return res.status(200).json({
        success: true,
        message: "get all id variants successfully !!!",
        ...variants,
      })
    } catch (err) {
      next(err)
    }
  }
  async getAllVariantsAndImage(req, res, next) {
    try {
      const variants = await ProductVariantService.getAllVariantsAndImage()

      return res.status(200).json({
        success: true,
        message: "get all id variants successfully !!!",
        variants,
      })
    } catch (err) {
      next(err)
    }
  }
  async getVariantsByProduct(req, res, next) {
    try {
      const variants = await ProductVariantService.getVariantsByProduct(
        req.params.productId,
      )

      return res.status(200).json({
        success: true,
        message: "Get product By Id successfully !!!",
        ...variants,
      })
    } catch (err) {
      next(err)
    }
  }

  async addVariant(req, res, next) {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        })
      }

      const variant = await ProductVariantService.createVariant(req.body)

      return res.status(201).json({
        success: true,
        message: "Create variant successfully",
        variant,
      })
    } catch (err) {
      next(err)
    }
  }

  async updateVariant(req, res, next) {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        })
      }

      const variant = await ProductVariantService.updateVariant(
        req.params.id,
        req.body,
      )

      return res.status(200).json({
        success: true,
        message: "Update variant successfully",
        variant,
      })
    } catch (err) {
      next(err)
    }
  }

  async deleteVariant(req, res, next) {
    try {
      const result = await ProductVariantService.deleteVariant(req.params.id)

      return res.status(200).json({
        success: true,
        ...result,
      })
    } catch (err) {
      next(err)
    }
  }

  async getVariantById(req, res, next) {
    try {
      const variant = await ProductVariantService.getVariantById(req.params.id)

      return res.status(200).json({
        success: true,
        message: "get variant by id successfully !!!",
        variant,
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new ProductVariantController()
