const BrandRepo = require("../repositories/BrandRepository")
const AppError = require("../utils/AppError")
const fs = require("fs")
const slugify = require("slugify")
const path = require("path")
class BrandService {
  async generateUniqueSlug(name, excludeId = null) {
    const baseSlug = slugify(name, {
      lower: true,
      strict: true,
      locale: "vi",
      trim: true,
    })

    if (!baseSlug) {
      throw new AppError(400, "Brand name is invalid")
    }

    let slug = baseSlug
    let counter = 1

    while (true) {
      const existingBrand = await BrandRepo.findBySlug(slug)

      if (
        !existingBrand ||
        (excludeId && String(existingBrand._id) === String(excludeId))
      ) {
        return slug
      }

      slug = `${baseSlug}-${counter}`
      counter++
    }
  }

  async getAllBrands() {
    return await BrandRepo.getAll()
  }

  async getBrandById(id) {
    if (!id) {
      throw new AppError(404, "Id brand is required")
    }

    const brand = await BrandRepo(id)
    return brand
  }
  async createBrand(data) {
    if (!data.name?.trim()) {
      throw new AppError(400, "Brand name is required")
    }

    const name = data.name.trim()

    const existingBrand = await BrandRepo.findByName(name)

    if (existingBrand) {
      throw new AppError(400, "Brand already exists")
    }

    const slug = await this.generateUniqueSlug(name)

    try {
      return await BrandRepo.create({
        ...data,
        name,
        slug,
      })
    } catch (err) {
      if (err.code === 11000) {
        throw new AppError(400, "Slug already exists")
      }

      throw err
    }
  }

  async updateBrand(id, data, file) {
    const oldBrand = await BrandRepo.findById(id)

    if (!oldBrand) {
      throw new AppError(404, "Brand not found")
    }

    const existed = await BrandRepo.findByName(data.name)

    if (existed && existed._id.toString() !== id) {
      throw new AppError(400, "Brand already exists")
    }

    const updateData = {
      ...data,
    }

    if (file) {
      updateData.logo_url = `/brand/${file.filename}`
    }

    const brand = await BrandRepo.updateById(id, updateData)

    if (file && oldBrand.logo_url) {
      const oldFilePath = path.join(
        __dirname,
        "../../public",
        oldBrand.logo_url,
      )

      if (fs.existsSync(oldFilePath)) {
        await fs.promises.unlink(oldFilePath)
      }
    }

    return brand
  }

  async deleteBrand(id) {
    const brand = await BrandRepo.findById(id)

    if (!brand) {
      throw new AppError(404, "Brand not found")
    }

    // xóa cả ảnh trong public

    if (brand.logo_url) {
      const filePath = path.join(__dirname, "../../public", brand.logo_url)
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath)
      }
    }
    await BrandRepo.deleteById(id)
    return {
      message: "Delete brand successfully",
    }
  }
}

module.exports = new BrandService()
