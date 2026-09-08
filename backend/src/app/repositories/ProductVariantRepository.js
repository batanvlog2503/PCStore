const filterAllProductVariants = require("../../helpers/filterAllProductVariants")
const sortableProductVariants = require("../../helpers/sortableProductVariants")
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
  async findByProductIds(productIds) {
    return await ProductVariant.find({
      product_id: {
        $in: productIds,
      },
    }).lean()
  }
  async findById(id) {
    return await ProductVariant.findById(id)
  }

  async createMany(data) {
    return await ProductVariant.insertMany(data)
  }
  async findByProductId(productId) {
    return await ProductVariant.find({
      product_id: productId,
    })
      .select("_id config_name sku price discount_price stock")
      .lean()
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
  async getAllWithProductAndImage(req) {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.max(Number(req.query.limit) || 40, 1)
    const sortable = sortableProductVariants(req)
    const skip = (page - 1) * limit
    const filter = filterAllProductVariants(req)
    const result = await ProductVariant.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product",
        },
      },

      {
        $unwind: "$product",
      },

      // 2. FILTER
      {
        $match: filter,
      },

      // 3. JOIN MAIN IMAGE
      {
        $lookup: {
          from: "productimages",
          let: {
            productId: "$product._id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$product_id", "$$productId"],
                },
              },
            },
            {
              $match: {
                is_main: true,
              },
            },
            {
              $limit: 1,
            },
          ],
          as: "mainImage",
        },
      },

      // 4. FORMAT DATA

      {
        $addFields: {
          image_url: {
            $arrayElemAt: ["$mainImage.image_url", 0],
          },

          product_name: "$product.name",

          product_slug: "$product.slug",

          discount_percent: {
            $cond: [
              {
                $and: [
                  { $ne: ["$discount_price", null] },
                  { $gt: ["$price", 0] },
                  { $lt: ["$discount_price", "$price"] },
                ],
              },
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $subtract: ["$price", "$discount_price"],
                      },
                      "$price",
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },

      // 5. REMOVE TEMP DATA

      {
        $project: {
          product: 0,
          mainImage: 0,
        },
      },
      // 6. SORT

      {
        $sort: sortable,
      },

      // 7. PAGINATION + TOTAL
      {
        $facet: {
          data: [
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
          ],

          totalCount: [
            {
              $count: "count",
            },
          ],
        },
      },
    ])

    const variants = result[0]?.data || []

    const total = result[0]?.totalCount[0]?.count || 0

    return {
      variants,
      total,
    }
  }
  async increaseStock(variantId, quantity, session) {
    return await ProductVariant.findByIdAndUpdate(
      {
        _id: variantId,
        status: "active",
      },
      { $inc: { stock: quantity } },
      { new: true, session },
    )
  }
  async decreaseStock(variantId, quantity, session) {
    const result = await ProductVariant.updateOne(
      {
        _id: variantId,
        status: "active",
        stock: { $gte: quantity },
      },
      {
        $inc: {
          stock: -quantity,
        },
      },
      {
        session,
      },
    )

    return result
  }
}

module.exports = new ProductVariantRepository()
