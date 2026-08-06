const ProductRepo = require("../repositories/ProductRepository")
const CategoryRepo = require("../repositories/CategoryRepository")
const BrandRepo = require("../repositories/BrandRepository")
const AppError = require("../utils/AppError")

class ProductService {
  async getAllProducts(req) {
    return await ProductRepo.getAll(req)
  }
  async getIdAndNameProduct() {
    return await ProductRepo.getIdAndNameProduct()
  }
  async getBestSeller() {
    return await ProductRepo.getBestSeller()
  }
  async getProductBySlug(slug) {
    if (!slug) {
      throw new AppError(400, "Slug is required")
    }

    const product = await ProductRepo.findBySlug(slug)

    if (!product) {
      throw new AppError(404, "Product not found")
    }

    return product
  }

  async createProduct(data) {
    const { category_id, brand_id, name, slug, description, status } = data

    if (!category_id || !brand_id || !name || !slug) {
      throw new AppError(400, "Missing required fields")
    }

    const category = await CategoryRepo.findById(category_id)

    if (!category) {
      throw new AppError(404, "Category not found")
    }

    const brand = await BrandRepo.findById(brand_id)

    if (!brand) {
      throw new AppError(404, "Brand not found")
    }

    const existed = await ProductRepo.findBySlug(slug)

    if (existed) {
      throw new AppError(400, "Slug already exists")
    }

    return await ProductRepo.create({
      category_id,
      brand_id,
      name,
      slug,
      description,
      status,
    })
  }

  async updateProduct(id, data) {
    const product = await ProductRepo.findById(id)

    if (!product) {
      throw new AppError(404, "Product not found")
    }

    if (data.category_id) {
      const category = await CategoryRepo.findById(data.category_id)

      if (!category) {
        throw new AppError(404, "Category not found")
      }
    }

    if (data.brand_id) {
      const brand = await BrandRepo.findById(data.brand_id)

      if (!brand) {
        throw new AppError(404, "Brand not found")
      }
    }

    if (data.slug) {
      const existed = await ProductRepo.findBySlug(data.slug)

      if (existed && existed._id.toString() !== id) {
        throw new AppError(400, "Slug already exists")
      }
    }

    return await ProductRepo.updateById(id, data)
  }
  
  async deleteProduct(id) {
    const product = await ProductRepo.findById(id)

    if (!product) {
      throw new AppError(404, "Product not found")
    }

    await ProductRepo.deleteById(id)

    return {
      message: "Delete product successfully",
    }
  }
}

module.exports = new ProductService()
