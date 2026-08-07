module.exports = (req) => {
  const filter = {}

  // Filter theo trạng thái
  if (req.query.status) {
    filter.status = req.query.status
  }

  // Search chính xác theo code
  if (req.query.code) {
    filter.code = req.query.code
  }

  return filter
}
