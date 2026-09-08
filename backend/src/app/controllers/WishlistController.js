const WishlistService = require("../services/WishlistService")

class WishlistController {
  async add(req, res, next) {
    try {
      const userId = req.user._id
      const { productId } = req.params

      const wishlist = await WishlistService.add(userId, productId)

      return res.status(201).json({
        success: true,
        message: "Đã thêm vào danh sách yêu thích",
        wishlist,
      })
    } catch (error) {
      next(error)
    }
  }

  async remove(req, res, next) {
    try {
      const userId = req.user._id
      const { productId } = req.params

      await WishlistService.remove(userId, productId)

      return res.status(200).json({
        success: true,
        message: "Đã bỏ khỏi danh sách yêu thích",
      })
    } catch (error) {
      next(error)
    }
  }

  async check(req, res, next) {
    try {
      const userId = req.user._id
      const { productId } = req.params

      const result = await WishlistService.check(userId, productId)

      return res.status(200).json({
        success: true,
        ...result,
      })
    } catch (error) {
      next(error)
    }
  }

  async getAll(req, res, next) {
    try {
      const userId = req.user._id

      const wishlists = await WishlistService.getAll(userId)

      return res.status(200).json({
        success: true,
        wishlists,
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new WishlistController()
