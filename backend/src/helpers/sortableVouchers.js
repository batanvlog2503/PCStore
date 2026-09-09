const sortableVouchers = (req) => {
  const sortType = req.query.sort || "newest"

  switch (sortType) {
    case "newest":
      return {
        created_at: -1,
      }

    case "oldest":
      return {
        created_at: 1,
      }

    case "expiring":
      return {
        end_date: 1,
      }

    case "discount":
      return {
        discount_value: -1,
        created_at: -1,
      }

    case "quantity":
      return {
        quantity: -1,
        created_at: -1,
      }

    default:
      return {
        created_at: -1,
      }
  }
}

module.exports = sortableVouchers
