const CartService = require("../services/CartService")
// tạo user thì auto có cả cart
const CartItemService = require("../services/CartItemService")
class CartController {
  async getAllCarts(req, res, next) {
    try {
      const { carts, total } = await CartService.getAllCarts()

      return res.status(200).json({
        success: true,
        message: "get all carts successfully !!!",
        total,
        carts,
      })
    } catch (err) {
      next(err)
    }
  }

  async getCartById(req, res, next) {
    try {
      const cart = await CartService.getCartById(req.params.id)

      return res.status(200).json({
        success: true,
        message: "get cart by id successfully !!!",
        cart,
      })
    } catch (err) {
      next(err)
    }
  }

  async getCartByUserId(req, res, next) {
    try {
      const cart = await CartService.getCartByUserId(req.params.userId)

      return res.status(200).json({
        message: "get cart by user id successfully !!!",
        success: true,
        cart,
      })
    } catch (err) {
      next(err)
    }
  }

  async createCart(req, res, next) {
    try {
      const cart = await CartService.createCart(req.body.user_id)

      return res.status(201).json({
        success: true,
        message: "Create cart successfully",
        cart,
      })
    } catch (err) {
      next(err)
    }
  }

  async deleteCart(req, res, next) {
    try {
      const result = await CartService.deleteCart(req.params.id)

      return res.status(200).json({
        success: true,
        ...result,
      })
    } catch (err) {
      next(err)
    }
  }

  async getMyCart(req, res, next) {
    try {
      const cart = await CartService.getCartByUserId(req.user._id)

      return res.status(200).json({
        success: true,
        message: "get my cart successfully!!!",
        cart,
      })
    } catch (err) {
      next(err)
    }
  }

  async getMyCartItems(req, res, next) {
    try {
      const userId = req.user._id

      const result = await CartItemService.getMyCartItems(userId)

      return res.status(200).json({
        success: true,
        message: "Get cart items successfully",
        ...result,
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new CartController()
