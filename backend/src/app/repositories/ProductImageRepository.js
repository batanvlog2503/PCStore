const ProductImage = require("../models/ProductImage")

class ProductImageRepository {
  async getByProductId(productId) {
    return await ProductImage.find({ product_id: productId })
  }

  async findById(id) {
    return await ProductImage.findById(id)
  }

  async createMany(data) {
    return await ProductImage.insertMany(data) // thay vì createData ta dùng insermany
  }

  async updateById(id, data) {
    return await ProductImage.findByIdAndUpdate(id, data, {
      new: true,
    })
  }

  async deleteById(id) {
    return await ProductImage.findByIdAndDelete(id)
  }
  async updateMany(productId) {
    return await ProductImage.updateMany(
      { product_id: productId }, // filter
      { is_main: false }, // update
    )
  }
  async setMain(id) {
    return await ProductImage.findByIdAndUpdate(
      id,
      { is_main: true },
      { new: true },
    )
  }
  async countImage(productId) {
    return await ProductImage.countDocuments({ product_id: productId })
  }

  async findMainImagesByProductIds(productIds) {
    return await ProductImage.find({
      product_id: {
        $in: productIds,
      },
      is_main: true,
    }).select("product_id image_url")
  }
}

module.exports = new ProductImageRepository()
