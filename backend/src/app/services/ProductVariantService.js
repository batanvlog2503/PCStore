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

  async getAllVariantsAndImage(req) {
    const { variants, total } =
      await ProductVariantRepo.getAllWithProductAndImage(req)
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.max(Number(req.query.limit) || 40, 1)
    return {
      variants,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
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

  async getTopSelling(req) {
    const limit = Math.max(Math.min(Number(req.query.limit) || 10, 20), 1)

    const variants = await ProductVariantRepo.getTopSelling(limit)

    return {
      variants,
    }
  }

  async updateVariantByVariantId(variantId, body) {
    const { sku, config_name, specs, price, discount_price, stock, status } =
      body

    const variant = await ProductVariantRepo.findById(variantId)

    if (!variant) {
      throw new AppError(404, "Không tìm thấy phiên bản sản phẩm")
    }

    if (!sku || !sku.trim()) {
      throw new AppError(400, "SKU không được để trống")
    }

    if (!config_name || !config_name.trim()) {
      throw new AppError(400, "Tên phiên bản không được để trống")
    }

    if (!specs) {
      throw new AppError(400, "Thông số kỹ thuật không được để trống")
    }

    if (!specs.cpu || !specs.cpu.trim()) {
      throw new AppError(400, "CPU không được để trống")
    }

    if (!specs.ram || Number(specs.ram) <= 0) {
      throw new AppError(400, "RAM không hợp lệ")
    }

    if (!specs.storage_capacity || Number(specs.storage_capacity) <= 0) {
      throw new AppError(400, "Dung lượng ổ cứng không hợp lệ")
    }

    if (!specs.storage_type) {
      throw new AppError(400, "Loại ổ cứng không được để trống")
    }

    if (!specs.gpu || !specs.gpu.trim()) {
      throw new AppError(400, "GPU không được để trống")
    }

    if (!specs.screen_size || Number(specs.screen_size) <= 0) {
      throw new AppError(400, "Kích thước màn hình không hợp lệ")
    }

    if (!price || Number(price) <= 0) {
      throw new AppError(400, "Giá bán phải lớn hơn 0")
    }

    if (
      discount_price !== null &&
      discount_price !== undefined &&
      discount_price !== "" &&
      Number(discount_price) > Number(price)
    ) {
      throw new AppError(400, "Giá khuyến mãi không được lớn hơn giá bán")
    }

    if (stock === undefined || stock === null || Number(stock) < 0) {
      throw new AppError(400, "Số lượng tồn kho không hợp lệ")
    }

    const validStatuses = ["active", "out_of_stock", "discontinued"]

    if (status && !validStatuses.includes(status)) {
      throw new AppError(400, "Trạng thái phiên bản không hợp lệ")
    }

    const existingSku = await ProductVariantRepo.findBySku(sku)

    if (existingSku && existingSku._id.toString() !== variantId.toString()) {
      throw new AppError(400, "SKU đã tồn tại")
    }

    // =========================
    // Data update
    // =========================
    const updateData = {
      sku: sku.trim(),

      config_name: config_name.trim(),

      specs: {
        cpu: specs.cpu.trim(),

        ram: Number(specs.ram),

        storage_capacity: Number(specs.storage_capacity),

        storage_type: specs.storage_type,

        gpu: specs.gpu.trim(),

        screen_size: Number(specs.screen_size),

        screen_resolution: specs.screen_resolution?.trim() || "",
      },

      price: Number(price),

      discount_price:
        discount_price !== null &&
        discount_price !== undefined &&
        discount_price !== ""
          ? Number(discount_price)
          : null,

      stock: Number(stock),

      status: status || "active",
    }

    const updatedVariant = await ProductVariantRepo.updateById(
      variantId,
      updateData,
    )

    return updatedVariant
  }
}

module.exports = new ProductVariantService()
