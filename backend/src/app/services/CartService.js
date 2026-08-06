const CartRepo = require("../repositories/CartRepository")
const AppError = require("../utils/AppError")

class CartService {
  async getAllCarts() {
    return await CartRepo.getAll()
  }

  async getCartById(id) {
    const cart = await CartRepo.findById(id)

    if (!cart) {
      throw new AppError(404, "Cart not found")
    }

    return cart
  }

  async getCartByUserId(userId) {
    const cart = await CartRepo.findByUserId(userId)

    if (!cart) {
      throw new AppError(404, "Cart not found")
    }

    return cart
  }

  async createCart(userId) {
    const exist = await CartRepo.findByUserId(userId)

    if (exist) {
      throw new AppError(400, "User already has a cart")
    }

    return await CartRepo.create({
      user_id: userId,
    })
  }

  async deleteCart(id) {
    const cart = await CartRepo.findById(id)

    if (!cart) {
      throw new AppError(404, "Cart not found")
    }

    await CartRepo.deleteById(id)

    return {
      message: "Delete cart successfully",
    }
  }
}

module.exports = new CartService()
