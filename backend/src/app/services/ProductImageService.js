const ProductImageRepo = require("../repositories/ProductImageRepository")
const ProductRepo = require("../repositories/ProductRepository")
const AppError = require("../utils/AppError")

const fs = require("fs")
const path = require("path")

class ProductImageService {
  async getAllImages(productId) {
    return await ProductImageRepo.getByProductId(productId)
  }

  async addImages(productId, files) {
    if (!productId) {
      throw new AppError(404, "Product Id is required")
    }
    console.log(productId)
    const product = await ProductRepo.findById(productId)

    if (!product) {
      throw new AppError(400, "Product not found")
    }

    if (!files || files.length === 0) {
      throw new AppError(400, "Images are required")
    }
    const count = await ProductImageRepo.countImage(productId)

    if (count + files.length > 10) {
      throw new AppError(400, "Maximum 10 images")
    }
    const images = files.map((file, index) => ({
      product_id: productId,
      image_url: `/product/${file.filename}`,
      is_main: index === 0,
    }))

    return await ProductImageRepo.createMany(images)
  }

  async updateImage(id, file) {
    const image = await ProductImageRepo.findById(id)

    if (!image) {
      throw new AppError(404, "Image not found")
    }

    if (!file) {
      throw new AppError(400, "Image is required")
    }

    const oldPath = path.join(__dirname, "../../public", image.image_url)

    const newData = {
      image_url: `/product/${file.filename}`,
    }

    const result = await ProductImageRepo.updateById(id, newData)

    if (fs.existsSync(oldPath)) {
      await fs.promises.unlink(oldPath)
    }

    return result
  }

  async deleteImage(id) {
    const image = await ProductImageRepo.findById(id)

    if (!image) {
      throw new AppError(404, "Image not found")
    }
    if (image.is_main) {
      const images = await ProductImageRepo.getByProductId(image.product_id)

      // Lấy ảnh khác đầu tiên (không phải ảnh đang xóa)
      const nextMain = images.find((item) => item._id.toString() !== id)

      if (nextMain) {
        await ProductImageRepo.setMain(nextMain._id)
      }
    }
    const filePath = path.join(__dirname, "../../public", image.image_url)

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath)
    }

    await ProductImageRepo.deleteById(id)

    return {
      message: "Delete image successfully",
    }
  }

  async setMainImage(id) {
    if (!id) {
      throw new AppError(404, "Id is required")
    }

    const productImage = await ProductImageRepo.findById(id)

    if (!productImage) {
      throw new AppError(400, "Product Image not found")
    }

    await ProductImageRepo.updateMany(productImage.product_id)

    // Đặt ảnh này thành ảnh chính
    return await ProductImageRepo.setMain(id)
  }
}

module.exports = new ProductImageService()
