module.exports = (req) => {
  const filter = {}

  // ================= SEARCH CODE =================
  if (req.query.search?.trim()) {
    filter.code = {
      $regex: req.query.search.trim(),
      $options: "i",
    }
  }

  // ================= STATUS =================
  if (req.query.status && req.query.status !== "all") {
    filter.status = req.query.status
  }

  // ================= VOUCHER TYPE =================
  if (req.query.voucher_type && req.query.voucher_type !== "all") {
    filter.voucher_type = req.query.voucher_type
  }

  // ================= DISCOUNT TYPE =================
  if (req.query.discount_type && req.query.discount_type !== "all") {
    filter.discount_type = req.query.discount_type
  }

  // ================= AVAILABLE =================
  // available=true => chỉ lấy voucher còn lượt
  if (req.query.available === "true") {
    filter.quantity = {
      $gt: 0,
    }
  }

  // ================= VALID =================
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
