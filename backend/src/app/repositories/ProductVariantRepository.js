const ProductVariant = require("../models/ProductVariant")

class ProductVariantRepository {
  async getAllProductVariants() {
    const [variants, total] = await Promise.all([
      ProductVariant.find().populate("product_id", "name slug"),
      ProductVariant.countDocuments(),
    ])
    return { total, variants }
  }
  async getVariantById(id) {
    return await ProductVariant.findById(id)
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
        // "name slug",
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

  // ProductVariantRepository.js
  async getAllWithProductAndImage() {
    return await ProductVariant.aggregate([
      // 1. Join sang Product để lấy tên, slug
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },

      // 2. Join sang ProductImage, chỉ lấy đúng 1 ảnh chính (is_main: true)
      //    của cùng product_id đó
      {
        $lookup: {
          from: "productimages",
          let: { productId: "$product._id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$product_id", "$$productId"] } } },
            { $match: { is_main: true } },
            { $limit: 1 },
          ],
          as: "mainImage",
        },
      },

      // 3. Làm phẳng dữ liệu ra, dễ dùng ở frontend
      {
        $addFields: {
          image_url: { $arrayElemAt: ["$mainImage.image_url", 0] },
          product_name: "$product.name",
          product_slug: "$product.slug",
        },
      },
      { $project: { product: 0, mainImage: 0 } },
    ])
  }

  async decreaseStock(id, quantity, session) {
    return await ProductVariant.updateOne(
      { _id: id },
      {
        $inc: {
          stock: -quantity,
        },
      },
      { session },
    )
  }
}

module.exports = new ProductVariantRepository()
