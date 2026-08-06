const CartItemRepo = require("../repositories/CartItemRepository")
const CartRepo = require("../repositories/CartRepository")
const ProductVariantRepo = require("../repositories/ProductVariantRepository")
const AppError = require("../utils/AppError")

class CartItemService {
  async getAllCartItems() {
    return await CartItemRepo.getAll()
  }

  async getCartItems(cartId) {
    return await CartItemRepo.getByCartId(cartId)
  }

  async addCartItem(data) {
    const { cart_id, variant_id, quantity } = data

    const cart = await CartRepo.findById(cart_id)

    if (!cart) {
      throw new AppError(404, "Cart not found")
    }

    const variant = await ProductVariantRepo.findById(variant_id)

    if (!variant) {
      throw new AppError(404, "Variant not found")
    }

    if (variant.status != "active") {
      throw new AppError(400, "Product discontinued !!!")
    }
    if (quantity > variant.stock) {
      throw new AppError(400, "Insufficient stock")
    }
    if (item.quantity + quantity > variant.stock) {
      throw new AppError(400, "Not enough stock")
    }
    const item = await CartItemRepo.findByCartAndVariant(cart_id, variant_id)

    if (item) {
      return await CartItemRepo.updateById(item._id, {
        quantity: item.quantity + quantity,
      })
    }

    return await CartItemRepo.create(data)
  }

  async updateQuantity(id, quantity) {
    const item = await CartItemRepo.findById(id)

    if (!item) {
      throw new AppError(404, "Cart Item not found")
    }

    if (quantity <= 0) {
      throw new AppError(400, "Quantity greater than 0")
    }
    return await CartItemRepo.updateById(id, {
      quantity,
    })
  }
  async clearCartItem(cartId) {
    if (!cartId) {
      throw new AppError(400, "Cart Id is required")
    }

    const cart = await CartRepo.findById(cartId)

    if (!cart) {
      throw new AppError(404, "Cart not found")
    }

    const result = await CartItemRepo.clearCart(cartId)

    return {
      message: "Clear cart successfully !!!",
      deletedCount: result.deletedCount,
    }
  }
  async deleteCartItem(id) {
    const item = await CartItemRepo.findById(id)

    if (!item) {
      throw new AppError(404, "Cart Item not found")
    }

    await CartItemRepo.deleteById(id)

    return {
      message: "Delete cart item successfully",
    }
  }
  async getCartSummary(cartId) {
    const result = await CartItemRepo.getCartSummary(cartId)

    return (
      result[0] || {
        totalQuantity: 0,
        totalPrice: 0,
      }
    )
  }
}

module.exports = new CartItemService()
