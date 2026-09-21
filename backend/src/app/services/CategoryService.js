const CategoryRepo = require("../repositories/CategoryRepository")
const AppError = require("../utils/AppError")
const slugify = require("slugify")
class CategoryService {
  async generateUniqueSlug(name, excludeId = null) {
    const baseSlug = slugify(name, {
      lower: true,
      strict: true,
      locale: "vi",
      trim: true,
    })

    let slug = baseSlug
    let counter = 1

    while (true) {
      const existingCategory = await CategoryRepo.findBySlug(slug)

      if (
        !existingCategory ||
        (excludeId && String(existingCategory._id) === String(excludeId))
      ) {
        return slug
      }

      slug = `${baseSlug}-${counter}`
      counter++
    }
  }
  async getAllCategories(search = "") {
    const categories = await CategoryRepo.getAll()

    const keyword = search.trim().toLowerCase()

    const filteredCategories = keyword
      ? categories.filter(
          (category) =>
            category.name.toLowerCase().includes(keyword) ||
            category.slug.toLowerCase().includes(keyword),
        )
      : categories

    const parents = categories.filter((category) => category.parent_id === null)

    const stats = {
      total: categories.length,
      parents: parents.length,
      children: categories.length - parents.length,
    }

    return {
      stats,
      categories: filteredCategories,
    }
  }

  async getCategoryTree() {
    const categories = await CategoryRepo.getAll()

    const buildTree = (parentId = null) => {
      return categories
        .filter((category) => String(category.parent_id) === String(parentId))
        .map((category) => ({
          ...category,
          children: buildTree(category._id),
        }))
    }

    const tree = buildTree()

    const total = categories.length
    const parents = categories.filter(
      (category) => category.parent_id === null,
    ).length
    const children = total - parents

    return {
      stats: {
        total,
        parents,
        children,
      },
      categories: tree,
    }
  }

  async getCategoryBySlug(slug) {
    if (!slug) {
      throw new AppError(400, "Slug is required")
    }
    const category = await CategoryRepo.findBySlug(slug)
    if (!category) {
      throw new AppError(404, "Category not found")
    }
    return category
  }

  async createCategory(data) {
    if (!data.name) {
      throw new AppError(400, "Name is required")
    }

    if (data.parent_id) {
      const parentCategory = await CategoryRepo.findById(data.parent_id)
      if (!parentCategory) {
        throw new AppError(404, "Parent category not found")
      }
    }

    const slug = await this.generateUniqueSlug(data.name)

    try {
      return await CategoryRepo.create({ ...data, slug })
    } catch (err) {
      if (err.code === 11000) {
        throw new AppError(400, "Slug already exists")
      }
      throw err
    }
  }

  async updateCategory(id, data) {
    const category = await CategoryRepo.findById(id)
    if (!category) {
      throw new AppError(404, "Category not found")
    }

    if (data.parent_id && String(data.parent_id) === String(id)) {
      throw new AppError(400, "A category cannot be its own parent")
    }

    if (data.parent_id) {
      const parent = await CategoryRepo.findById(data.parent_id)
      if (!parent) {
        throw new AppError(400, "Parent category not found")
      }
    }

    const updateData = { ...data }

    // Đổi tên -> sinh lại slug mới (trừ trường hợp trùng tên cũ)
    if (data.name && data.name !== category.name) {
      updateData.slug = await this.generateUniqueSlug(data.name, id)
    }

    try {
      return await CategoryRepo.updateById(id, updateData)
    } catch (err) {
      if (err.code === 11000) {
        throw new AppError(400, "Slug already exists")
      }
      throw err
    }
  }

  async deleteCategory(id) {
    const category = await CategoryRepo.findById(id)
    if (!category) {
      throw new AppError(404, "Category not found")
    }

    // Không cho xoá nếu còn danh mục con -> tránh để lại "con mồ côi"
    // trỏ parent_id về 1 category không còn tồn tại
    const childrenCount = await CategoryRepo.countChildren(id)
    if (childrenCount > 0) {
      throw new AppError(
        400,
        "Cannot delete a category that still has child categories",
      )
    }

    await CategoryRepo.deleteById(id)
    return { message: "Category deleted successfully" }
  }
}

module.exports = new CategoryService()
