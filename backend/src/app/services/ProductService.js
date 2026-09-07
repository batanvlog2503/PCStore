const slugify = require("slugify")
const ProductRepo = require("../repositories/ProductRepository")
const CategoryRepo = require("../repositories/CategoryRepository")
const BrandRepo = require("../repositories/BrandRepository")
const AppError = require("../utils/AppError")
const Product = require("../models/Product")
const ProductVariantRepo = require("../repositories/ProductVariantRepository")
const ProductImageRepo = require("../repositories/ProductImageRepository")
const ProductVariant = require("../models/ProductVariant")
const ProductImage = require("../models/ProductImage")
const filterAllProducts = require("../../helpers/filterAllProducts")

const generateUniqueSlug = async (name) => {
  const baseSlug = slugify(name, {
    lower: true,
    strict: true,
    locale: "vi",
  })

  let slug = baseSlug
  let counter = 1

  while (await ProductRepo.findBySlug(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}
class ProductService {
  async getAllProducts(req) {
    return await ProductRepo.getAll(req)
  }

  async getProductDetail(productId) {
    if (!productId) {
      throw new AppError(404, "Product Id is required")
    }

    const product = await Product.findById(productId).populate("brand_id")

    if (!product) throw new AppError(404, "Product not found")

    const variants = await ProductVariant.find({
      product_id: productId,
      status: "active",
    })

    const images = await ProductImage.find({
      product_id: productId,
    }).sort({
      is_main: -1,
    })

    return {
      product,
      variants,
      images,
    }
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

  async createProduct({ body, files }) {
    const {
      name,
      category_id,
      brand_id,
      description,
      status,
      mainImageIndex,
      variants,
    } = body
    if (!name) {
      throw new Error("Tên sản phẩm không được để trống")
    }

    if (!category_id) {
      throw new Error("Danh mục không được để trống")
    }

    if (!brand_id) {
      throw new Error("Thương hiệu không được để trống")
    }

    if (!variants) {
      throw new Error("Sản phẩm phải có ít nhất một phiên bản")
    }
    if (!files || files.length === 0) {
      throw new AppError(400, "Sản phẩm phải có ít nhất một ảnh")
    }
    // chuyyeenr variants thành json vì trước đó formData -> stringtify

    // variants từ FormData là JSON string
    let parsedVariants

    try {
      parsedVariants = JSON.parse(variants)
    } catch (error) {
      throw new Error("Dữ liệu variants không hợp lệ")
    }

    if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
      throw new Error("Sản phẩm phải có ít nhất một phiên bản")
    }
    const category = await CategoryRepo.findById(category_id)

    if (!category) {
      throw new AppError(404, "Category not found")
    }

    const brand = await BrandRepo.findById(brand_id)

    if (!brand) {
      throw new AppError(404, "Brand not found")
    }

    const slug = await generateUniqueSlug(name)
    // 1. tạo Product và sẽ tạo ra ProductId
    const product = await ProductRepo.create({
      category_id,
      brand_id,
      name,
      slug,
      description,
      status: status || "active",
    })

    // Product đã có ID
    const productId = product._id
    // 2. TẠO PRODUCT IMAGES

    let images = []
    if (files && files.length > 0) {
      const mainIndex = Number(mainImageIndex)
      if (mainIndex < 0 || mainIndex >= files.length) {
        throw new AppError(400, "Ảnh chính không hợp lệ")
      }
      const imagesData = files.map((file, index) => ({
        product_id: productId,
        image_url: `/product/${file.filename}`,
        is_main: index === mainIndex,
      }))

      images = await ProductImageRepo.insertMany(imagesData)

      const mainImage = images.find((image) => image.is_main)

      if (mainImage) {
        await ProductRepo.updateById(productId, {
          image_url: mainImage.image_url,
        })
      }
    }
    parsedVariants.forEach((variant, index) => {
      if (!variant.sku?.trim()) {
        throw new AppError(
          400,
          `SKU phiên bản ${index + 1} không được để trống`,
        )
      }

      if (!variant.config_name?.trim()) {
        throw new AppError(
          400,
          `Tên cấu hình phiên bản ${index + 1} không được để trống`,
        )
      }

      if (!variant.price || Number(variant.price) <= 0) {
        throw new AppError(400, `Giá phiên bản ${index + 1} không hợp lệ`)
      }
    })
    // 3. TẠO PRODUCT VARIANTS
    const variantsData = parsedVariants.map((variant) => ({
      product_id: productId,

      sku: variant.sku,

      config_name: variant.config_name,

      specs: {
        cpu: variant.specs.cpu,
        ram: Number(variant.specs.ram),
        storage_capacity: Number(variant.specs.storage_capacity),
        storage_type: variant.specs.storage_type,
        gpu: variant.specs.gpu,
        screen_size: Number(variant.specs.screen_size),
        screen_resolution: variant.specs.screen_resolution,
      },

      price: Number(variant.price),

      discount_price:
        variant.discount_price !== null &&
        variant.discount_price !== undefined &&
        variant.discount_price !== ""
          ? Number(variant.discount_price)
          : null,

      status: variant.status || "active",
      stock: Number(variant.stock) || 0,
    }))

    const createdVariants = await ProductVariantRepo.createMany(variantsData)

    return {
      product,
      images,
      variants: createdVariants,
    }
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

  // admin
  async adminGetProducts(req) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status,
      priceFrom,
      priceTo,
    } = req.query

    const currentPage = Math.max(Number(page), 1)
    const currentLimit = Math.max(Number(limit), 1)

    const skip = (currentPage - 1) * currentLimit

    const filter = filterAllProducts(req)

    const [products, total] = await Promise.all([
      ProductRepo.adminFindAllProducts({
        filter,
        skip,
        limit: currentLimit,
      }),

      ProductRepo.countProducts(filter),
    ])
    // danh sách sản phẩm Product
    const productIds = products.map((product) => product._id)

    if (productIds.length === 0) {
      return {
        products: [],
        total,
        page: currentPage,
        limit: currentLimit,
        totalPages: 0,
      }
    }

    // lấy tất cả all variants + main image
    // lấy hết image cùng với varants của prduct_id đó
    const [variants, mainImages] = await Promise.all([
      ProductVariantRepo.findByProductIds(productIds),

      ProductImageRepo.findMainImagesByProductIds(productIds),
    ])

    // mainImages là 1 mảng ảnh chính

    const variantsMap = new Map()

    variants.forEach((variant) => {
      const productId = variant.product_id.toString()

      if (!variantsMap.has(productId)) {
        variantsMap.set(productId, [])
      }

      variantsMap.get(productId).push(variant) // kiểu mỗi sản phẩm có nhiều variant
      //     variantsMap = {
      // product1: [
      //   {
      //     _id: "v1",
      //     sku: "PC4060-I5",
      //   },
      //   {
      //     _id: "v2",
      //     sku: "PC4060-I7",
      //   },
      // ],
    })

    // GROUP MAIN IMAGE

    const imageMap = new Map()

    mainImages.forEach((image) => {
      imageMap.set(image.product_id.toString(), image.image_url)
    })

    let result = products.map((product) => {
      const productId = product._id.toString()

      const productVariants = variantsMap.get(productId) || []
      // lấy key là productId và value là array dãy variants
      const prices = productVariants
        .map((variant) => variant.discount_price)
        .filter((price) => price != null)

      const minPrice = prices.length > 0 ? Math.min(...prices) : null
      const totalStock = productVariants.reduce((total, variant) => {
        return total + (variant.stock || 0)
      }, 0)
      return {
        _id: product._id,

        name: product.name,
        created_at: product.created_at,
        min_price: minPrice,
        totalStock,
        category: product.category_id
          ? {
              _id: product.category_id._id,
              name: product.category_id.name,
            }
          : null,

        status: product.status,

        image_url: imageMap.get(productId) || null,

        variants: productVariants,
      }
    })

    if (priceFrom || priceTo) {
      result = result.filter((product) => {
        const prices = product.variants.map((variant) => variant.discount_price)

        if (prices.length === 0) return false

        const minPrice = Math.min(...prices)

        if (priceFrom && minPrice < Number(priceFrom)) {
          return false
        }
        //priceFrom < minPrice < priceTo
        if (priceTo && minPrice > Number(priceTo)) {
          return false
        }

        return true
      })
    }

    return {
      total,

      page: currentPage,

      limit: currentLimit,

      totalPages: Math.ceil(total / currentLimit),
      products: result,
    }
  }
  async adminGetProductDetail(productId) {
    const product = await ProductRepo.findById(productId)

    if (!product) {
      throw new Error("Không tìm thấy sản phẩm")
    }

    const [images, variants] = await Promise.all([
      ProductImageRepo.findByProductId(productId),
      ProductVariantRepo.findByProductId(productId),
    ])
    const totalStock = variants.reduce((total, variant) => {
      return total + (variant.stock || 0)
    }, 0)
    return {
      _id: product._id,
      name: product.name,
      totalStock,
      created_at: product.created_at,
      category: product.category_id
        ? {
            _id: product.category_id._id,
            name: product.category_id.name,
          }
        : null,

      status: product.status,

      images,

      variants: variants.map((variant) => ({
        _id: variant._id,
        config_name: variant.config_name,
        sku: variant.sku,
        price: variant.price,
        discount_price: variant.discount_price,
        stock: variant.stock,
      })),
    }
  }
  async getProductStats() {
    const [total, active, hidden, deleted] = await Promise.all([
      ProductRepo.countProducts({
        deleted: { $ne: true },
      }),

      ProductRepo.countProducts({
        status: "active",
        deleted: { $ne: true },
      }),

      ProductRepo.countProducts({
        status: "hidden",
        deleted: { $ne: true },
      }),

      ProductRepo.countProducts({
        deleted: true,
      }),
    ])

    return {
      total,
      active,
      hidden,
      deleted,
    }
  }

  async deleteProduct(productId) {
    const product = await ProductRepo.findById(productId)

    if (!product) {
      throw new AppError(404, "Product not found")
    }

    return await ProductRepo.softDelete(productId)
  }
}

module.exports = new ProductService()
