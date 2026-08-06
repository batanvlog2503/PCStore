const Product = require("../models/Product")
const paginationHelper = require("../../helpers/pagination")
const sortableHelper = require("../../helpers/sortable")
const searchHelper = require("../../helpers/search")
const filterHelper = require("../../helpers/filter")
class ProductRepository {
  // full GET /product/all?search=asus&brand=6a735...&status=active&sort=sold_count&order=desc&page=2&limit=8
  // pagination http://localhost:3000/product/all?page=2&limit=5
  // sort GET /product/all?sort=name&order=ascGET /product/all?sort=name&order=asc
  async getAll(req) {
    const search = searchHelper(req)
    const filter = filterHelper(req)
    const sortable = sortableHelper(req)
    const pagination = paginationHelper(req)
    const query = {
      ...search,
      ...filter,
    }
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortable)
        .skip(pagination.skip)
        .limit(pagination.limit)
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

  async getBestSeller(limit = 10) {
    return await Product.find({ status: "active" })
      .sort({ sold_count: -1 })
      .limit(limit)
      .populate("category_id", "name slug")
      .populate("brand_id", "name logo_url")
  }
}

module.exports = new ProductRepository()
