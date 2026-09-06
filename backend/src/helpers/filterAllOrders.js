module.exports = (req) => {
  const filter = {}

  if (req.query.status && req.query.status !== "all") {
    filter.status = req.query.status
  }

  if (req.query.payment && req.query.payment !== "all") {
    filter.payment_method = req.query.payment
  }

  if (req.query.fromDate) {
    filter.created_at = {
      ...filter.created_at, // không có cái này object 2 ghi đề object 1
      $gte: new Date(req.query.fromDate),
    }
  }

  if (req.query.toDate) {
    const toDate = new Date(req.query.toDate)

    // lấy hết ngày đó
    toDate.setHours(23, 59, 59, 999)

    filter.created_at = {
      ...filter.created_at,
      $lte: toDate,
    }
  }

  return filter
}
