const ProductVariant = require("../models/ProductVariant")

class ProductVariantRepository {
  async getAllProductVariants() {
    const [variants, total] = await Promise.all([
      ProductVariant.find().populate("product_id", "name slug"),
      ProductVariant.countDocuments(),
    ])
    return { total, variants }
  }
  // .populate("product_id", "name slug")
  async getAllId() {
    return await ProductVariant.find()
      .select("_id product_id")
      .populate("product_id", "_id")
  }
  async getByProduct(productId) {
    const [variants, total] = await Promise.all([
      ProductVariant.find({ product_id: productId }).populate(
        "product_id",
        "name slug",
      ),
      ProductVariant.countDocuments({ product_id: productId }),
    ])
    return { total, variants }
  }

  async findById(id) {
    return await ProductVariant.findById(id)
  }

  async findBySku(sku) {
    return await ProductVariant.findOne({ sku })
  }

  async create(data) {
    return await ProductVariant.create(data)
  }

  async updateById(id, data) {
    return await ProductVariant.findByIdAndUpdate(id, data, {
      new: true,
    })
  }

  async deleteById(id) {
    return await ProductVariant.findByIdAndDelete(id)
  }
}

module.exports = new ProductVariantRepository()
