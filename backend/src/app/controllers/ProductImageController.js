const ProductImageService = require("../services/ProductImageService")

class ProductImageController {
  async getAllImages(req, res, next) {
    try {
      const images = await ProductImageService.getAllImages(
        req.params.productId,
      )

      return res.status(200).json({
        success: true,
        message: "get All images Successfully !!!",
        total: images.length,
        images,
      })
    } catch (err) {
      next(err)
    }
  }

  async addImages(req, res, next) {
    try {
      const images = await ProductImageService.addImages(
        req.body.product_id,
        req.files,
      ) // req.files với array
      console.log(req.body)
      console.log(req.files)
      return res.status(201).json({
        success: true,
        message: "Add images successfully",
        images,
      })
    } catch (err) {
      next(err)
    }
  }

  async updateImage(req, res, next) {
    try {
      const image = await ProductImageService.updateImage(
        req.params.id,
        req.file,
      )

      return res.status(200).json({
        success: true,
        message: "Update image successfully",
        image,
      })
    } catch (err) {
      next(err)
    }
  }

  async deleteImage(req, res, next) {
    try {
      const result = await ProductImageService.deleteImage(req.params.id)

      return res.status(200).json({
        success: true,
        ...result,
      })
    } catch (err) {
      next(err)
    }
  }
  async setMainImage(req, res, next) {
    try {
      const productImage = await ProductImageService.setMainImage(req.params.id)

      return res.status(200).json({
        success: true,
        message: "Set main image successfully",
        productImage,
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new ProductImageController()
