module.exports = (req) => {
  const filter = {}

  if (req.query.search?.trim()) {
    filter.code = {
      $regex: req.query.search.trim(),
      $options: "i",
    }
  }

  if (req.query.status && req.query.status !== "all") {
    filter.status = req.query.status
  }

  if (req.query.voucher_type && req.query.voucher_type !== "all") {
    filter.voucher_type = req.query.voucher_type
  }

  if (req.query.discount_type && req.query.discount_type !== "all") {
    filter.discount_type = req.query.discount_type
  }

  if (req.query.available === "true") {
    filter.quantity = {
      $gt: 0,
    }
  }

  // valid=true => voucher đang trong thời gian sử dụng
  if (req.query.valid === "true") {
    const now = new Date()

    filter.start_date = {
      $lte: now,
    }

    filter.end_date = {
      $gte: now,
    }
  }

  return filter
}
