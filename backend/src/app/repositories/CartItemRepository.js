const CartItem = require("../models/CartItem")
const mongoose = require("mongoose")
const ProductImage = require("../models/ProductImage")
class CartItemRepository {
  async findByIdsAndCart(cartItemIds, cartId) {
    return await CartItem.find({
      _id: { $in: cartItemIds },
      cart_id: cartId,
    }).populate({
      path: "variant_id",
      populate: { path: "product_id", select: "name" },
    })
  }
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
    const items = await CartItem.find({
      cart_id: cartId,
    })
      .populate({
        path: "variant_id",
        populate: {
          path: "product_id",
        },
      })
      .lean()
    // lấy items
    // Lấy danh sách product_id// của tất cả cart-item
    const productIds = items
      .map((item) => item.variant_id?.product_id?._id)
      .filter(Boolean)

    // Lấy toàn bộ ảnh chính trong 1 query
    const images = await ProductImage.find({
      product_id: { $in: productIds }, // chỉ cần product_id trong list-product_id
      is_main: true, // main
    }).lean()

    // Map product_id -> image_url
    const imageMap = new Map(
      images.map((image) => [image.product_id.toString(), image.image_url]), // tạo map [productId, image_url]
    ) // tại sao dùng product_id.toString

    const formattedItems = items.map((item) => {
      const product = item.variant_id?.product_id

      const productId = product?._id?.toString()

      return {
        // CartItem
        _id: item._id,
        quantity: item.quantity,

        // Variant
        variant_id: item.variant_id?._id,
        sku: item.variant_id?.sku,
        config_name: item.variant_id?.config_name,

        price: item.variant_id?.price,
        discount_price: item.variant_id?.discount_price,
        stock: item.variant_id?.stock,

        // Product
        product_id: product?._id,
        product_name: product?.name,
        product_slug: product?.slug,

        // ProductImage
        image_url: imageMap.get(productId) || null,
      }
    })

    return {
      total: formattedItems.length,
      items: formattedItems,
    }
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

  async deleteManyByIds(ids, session) {
    return await CartItem.deleteMany(
      {
        _id: { $in: ids },
      },
      { session },
    )
  }
}

module.exports = new CartItemRepository()
