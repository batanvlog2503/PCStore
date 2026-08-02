const CategoryRepo = require("../repositories/CategoryRepository")
const AppError = require("../utils/AppError")
class CategoryService {
  async getAllCategories() {
    return await CategoryRepo.getAll()
  }

  async getCategoryTree() {
    // trả về dạng cây cha con

    const categories = await CategoryRepo.getAll()

    const buildTree = (parentId = null) => {
      return categories
        .filter((category) => String(category.parent_id) === String(parentId))
        .map((category) => ({
          ...category,
          children: buildTree(category._id),
        }))
    }
    //     Kết quả cuối cùng (buildTree(null)):
    // [
    //   { name: "Laptop", children: [] },
    //   { name: "Linh kiện", children: [
    //       { name: "RAM", children: [] },
    //       { name: "SSD", children: [] }
    //     ]
    //   }
    // ]

    return buildTree()
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
    if (!data.name || !data.slug) {
      throw new AppError(400, "Name and slug are required")
    }

    // nếu có parend_id thì phải check xem tồn tại không

    if (data.parent_id) {
      const parentCategory = await CategoryRepo.findById(data.parent_id)
      if (!parentCategory) {
        throw new AppError(404, "Parent category not found")
      }
    }

    try {
      return await CategoryRepo.create(data)
    } catch (err) {
      // Bắt lỗi trùng slug (unique index) trả về message thân thiện,
      // thay vì để lỗi MongoDB thô (E11000 duplicate key) hiện ra
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

    // Chặn trường hợp đơn giản nhất: tự đặt mình làm cha của chính mình
    // (chưa chặn được vòng lặp sâu hơn, VD: A -> B -> C -> A, coi như giới hạn cơ bản)
    if (data.parent_id && String(data.parent_id) === String(id)) {
      throw new AppError(400, "A category cannot be its own parent")
    }

    if (data.parent_id) {
      const parent = await CategoryRepo.findById(data.parent_id)
      if (!parent) {
        throw new AppError(400, "Parent category not found")
      }
    }

    try {
      return await CategoryRepo.updateById(id, data)
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

    // TODO: khi đã có Product model, nên check thêm:
    // const productCount = await ProductRepo.countByCategoryId(id)
    // if (productCount > 0) throw new AppError(400, "Cannot delete category that still has products")

    await CategoryRepo.deleteById(id)
    return { message: "Category deleted successfully" }
  }
}

module.exports = new CategoryService()
