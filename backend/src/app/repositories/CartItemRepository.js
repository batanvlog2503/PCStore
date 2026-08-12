const CartItem = require("../models/CartItem")
const mongoose = require("mongoose")
class CartItemRepository {
  async getAll() {
    const [cartItems, total] = await Promise.all([
      CartItem.find()
        .populate("cart_id")
        .populate({
          path: "variant_id",
          populate: {
            path: "product_id",
          },
        }),
      CartItem.countDocuments(),
    ])

    return { cartItems, total }
  }

  async getByCartId(cartId) {
    return await CartItem.find({ cart_id: cartId }).populate({
      path: "variant_id",
      populate: {
        path: "product_id",
      },
    })
  }

  async findByCartId(cartId) {
    const [items, totalItem] = await Promise.all([
      CartItem.find({
        cart_id: cartId,
      }).populate({
        path: "variant_id",
        populate: {
          path: "product_id",
        },
      }),
      CartItem.countDocuments({ cart_id: cartId }),
    ])

    return { totalItem, items }
  }
  async findById(id) {
    return await CartItem.findById(id)
  }

  async findByCartAndVariant(cartId, variantId) {
    return await CartItem.findOne({
      cart_id: cartId,
      variant_id: variantId,
    })
  }

  async create(data) {
    return await CartItem.create(data)
  }

  async updateById(id, data) {
    return await CartItem.findByIdAndUpdate(id, data, {
      new: true,
    })
  }

  async deleteById(id) {
    return await CartItem.findByIdAndDelete(id)
  }
  async clearCart(cartId) {
    return await CartItem.deleteMany({ cart_id: cartId })
  }
  async getCartSummary(cartId) {
    return await CartItem.aggregate([
      {
        $match: {
          cart_id: new mongoose.Types.ObjectId(cartId),
        },
      },
      {
        $lookup: {
          from: "productvariants",
          localField: "variant_id",
          foreignField: "_id",
          as: "variant",
        },
      },
      {
        $unwind: "$variant",
      },
      {
        $project: {
          quantity: 1,
          price: {
            $ifNull: ["$variant.discount_price", "$variant.price"],
          },
        },
      },
      {
        $project: {
          quantity: 1,
          subtotal: {
            $multiply: ["$quantity", "$price"],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalQuantity: {
            $sum: "$quantity",
          },
          totalPrice: {
            $sum: "$subtotal",
          },
        },
      },
    ])
  }
}

module.exports = new CartItemRepository()
