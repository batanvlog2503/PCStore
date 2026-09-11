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

  async uploadImages(productId, files) {
    if (!files || files.length === 0) {
      throw new Error("Không có ảnh để upload")
    }

    const oldImages = await ProductImageRepo.findByProductId(productId)
    // old image không có ảnh
    const isFirstImage = oldImages.length === 0

    const imageData = files.map((file, index) => ({
      product_id: productId,
      image_url: `/product/${file.filename}`,
      is_main: isFirstImage && index === 0, // set ảnh đầu là main
    }))

    return await ProductImageRepo.insertMany(imageData)
  }

  async updateMainImage(productId, imageId) {
    if (!productId) {
      throw new AppError(404, "productId not found")
    }
    if (!imageId) {
      throw new AppError(404, "imageId not found")
    }
    const image = await ProductImageRepo.findById(imageId)

    if (!image) {
      throw new Error("Không tìm thấy ảnh")
    }

    if (image.product_id.toString() !== productId.toString()) {
      throw new Error("Ảnh không thuộc sản phẩm này")
    }

    await ProductImageRepo.setAllNotMain(productId)

    return await ProductImageRepo.setMain(imageId)
  }

  async deleteImage(imageId) {
    const image = await ProductImageRepo.findById(imageId)

    if (!image) {
      throw new Error("Không tìm thấy ảnh")
    }

    const wasMain = image.is_main

    await ProductImageRepo.deleteById(imageId)

    // Nếu xóa ảnh chính thì chọn ảnh đầu tiên còn lại
    if (wasMain) {
      const remainingImages = await ProductImageRepo.findByProductId(
        image.product_id,
      )

      if (remainingImages.length > 0) {
        await ProductImageRepo.setAllNotMain(image.product_id)

        await ProductImageRepo.setMain(remainingImages[0]._id)
      }
    }

    return image
  }
}

module.exports = new ProductImageService()
