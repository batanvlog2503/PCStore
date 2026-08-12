const ProductVariantRepo = require("../repositories/ProductVariantRepository")
const ProductRepo = require("../repositories/ProductRepository")
const AppError = require("../utils/AppError")

class ProductVariantService {
  async getAllVariants() {
    return await ProductVariantRepo.getAllProductVariants()
  }
  async getVariantById(id) {
    if (!id) {
      throw new AppError(404, "Id is required")
    }
    return await ProductVariantRepo.findById(id)
  }
  async getAllVariantsAndImage() {
    return await ProductVariantRepo.getAllWithProductAndImage()
  }
  async getAllId() {
    return await ProductVariantRepo.getAllId()
  }
  async getVariantsByProduct(productId) {
    return await ProductVariantRepo.getByProduct(productId)
  }

  async createVariant(data) {
    const product = await ProductRepo.findById(data.product_id)

    if (!product) {
      throw new AppError(404, "Product not found")
    }

    const existedSku = await ProductVariantRepo.findBySku(data.sku)

    if (existedSku) {
      throw new AppError(400, "SKU already exists")
    }

    return await ProductVariantRepo.create(data)
  }

  async updateVariant(id, data) {
    const variant = await ProductVariantRepo.findById(id)

    if (!variant) {
      throw new AppError(404, "Variant not found")
    }

    if (data.sku) {
      const existedSku = await ProductVariantRepo.findBySku(data.sku)

      if (existedSku && existedSku._id.toString() !== id) {
        throw new AppError(400, "SKU already exists")
      }
    }

    return await ProductVariantRepo.updateById(id, data)
  }

  async deleteVariant(id) {
    const variant = await ProductVariantRepo.findById(id)

    if (!variant) {
      throw new AppError(404, "Variant not found")
    }

    await ProductVariantRepo.deleteById(id)

    return {
      message: "Delete variant successfully",
    }
  }
}

module.exports = new ProductVariantService()
