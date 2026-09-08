const WishlistRepo = require("../repositories/WishListRepository")
const AppError = require("../utils/AppError")

class WishlistService {
  async add(userId, productId) {
    if (!userId) {
      throw new AppError(404, "User id not found")
    }
    if (!productId) {
      throw new AppError(404, "ProductId not found")
    }
    const exists = await WishlistRepo.findByUserAndProduct(userId, productId)

    if (exists) {
      throw new AppError(400, "Sản phẩm đã có trong danh sách yêu thích")
    }

    return await WishlistRepo.create(userId, productId)
  }

  async remove(userId, productId) {
    if (!userId) {
      throw new AppError(404, "User id not found")
    }
    if (!productId) {
      throw new AppError(404, "ProductId not found")
    }
    const result = await WishlistRepo.delete(userId, productId)

    if (result.deletedCount === 0) {
      throw new AppError(404, "Không tìm thấy sản phẩm yêu thích")
    }

    return result
  }

  async check(userId, productId) {
    const wishlist = await WishlistRepo.findByUserAndProduct(userId, productId)

    return {
      isWishlisted: Boolean(wishlist),
    }
  }

  async getAll(userId) {
    return await WishlistRepo.getAllByUser(userId)
  }
}

module.exports = new WishlistService()
