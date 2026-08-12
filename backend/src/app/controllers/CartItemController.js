const CartItemService = require("../services/CartItemService")
const CartService = require("../services/CartService")

class CartItemController {
  async getAllCartItems(req, res, next) {
    try {
      const { cartItems, total } = await CartItemService.getAllCartItems()

      return res.status(200).json({
        success: true,
        message: "Get all cart items successfully",
        total,
        cartItems,
      })
    } catch (err) {
      next(err)
    }
  }

  async getCartItems(req, res, next) {
    try {
      const items = await CartItemService.getCartItems(req.params.cartId)

      return res.status(200).json({
        success: true,
        message: "Get cart Item by cartId successfully !!!",
        total: items.length,
        items,
      })
    } catch (err) {
      next(err)
    }
  }

  async addCartItem(req, res, next) {
    try {
      const { variant_id, quantity } = req.body

      const cart = await CartService.getCartByUserId(req.user._id)

      if (!cart) {
        throw new AppError(404, "Cart not found")
      }

      const item = await CartItemService.addCartItem({
        cart_id: cart._id,
        variant_id,
        quantity,
      })

      return res.status(200).json({
        success: true,
        message: "Add cart item successfully",
        item,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateQuantity(req, res, next) {
    try {
      const item = await CartItemService.updateQuantity(
        req.params.id,
        req.body.quantity,
      )

      return res.status(200).json({
        success: true,
        message: "Update quantity successfully",
        item,
      })
    } catch (err) {
      next(err)
    }
  }

  async deleteCartItem(req, res, next) {
    try {
      const result = await CartItemService.deleteCartItem(req.params.id)

      return res.status(200).json({
        success: true,
        ...result,
      })
    } catch (err) {
      next(err)
    }
  }
  async clearCartItem(req, res, next) {
    try {
      const result = await CartItemService.clearCartItem(req.params.cartId)

      return res.status(200).json({
        success: true,
        ...result,
      })
    } catch (err) {
      next(err)
    }
  }
  async getCartSummary(req, res, next) {
    try {
      const summary = await CartItemService.getCartSummary(req.params.cartId)

      return res.status(200).json({
        success: true,
        message: "get summary successfully !!!",
        summary,
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new CartItemController()
