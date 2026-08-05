const Product = require("../models/Product")
const searchHelper = require("../../helpers/search")
const filterHelper = require("../../helpers/filter")
class ProductRepository {
  async getAll(req) {
    const search = searchHelper(req)
    const filter = filterHelper(req)

    const query = {
      ...search,
      ...filter,
    }
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category_id", "name slug")
        .populate("brand_id", "name logo_url"),
      Product.countDocuments(query),
    ])

    return {
      products,
      total,
    }
  }
  //   async search(keyword) {
  //     return await Product.find({
  //       name: {
  //         $regex: keyword,
  //         $options: "i",
  //       },
  //     })
  //   }
  async findById(id) {
    return await Product.findById(id)
      .populate("category_id", "name slug")
      .populate("brand_id", "name logo_url")
  }

  async findBySlug(slug) {
    return await Product.findOne({ slug })
  }

  async create(data) {
    return await Product.create(data)
  }

  async updateById(id, data) {
    return await Product.findByIdAndUpdate(id, data, {
      new: true,
    })
  }

  async deleteById(id) {
    return await Product.findByIdAndDelete(id)
  }
}

module.exports = new ProductRepository()
