const sortableProductVariants = (req) => {
  const sortType = req.query.sort || "popular"

  switch (sortType) {
    case "price_asc":
      return {
        price: 1,
      }

    case "price_desc":
      return {
        price: -1,
      }

    case "popular":
      return {
        "product.sold_count": -1,
        created_at: -1,
      }

    case "hot":
      return {
        discount_percent: -1,
        created_at: -1,
      }

    default:
      return {
        created_at: -1,
      }
  }
}

module.exports = sortableProductVariants
