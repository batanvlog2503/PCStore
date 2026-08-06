module.exports = (req) => {
  const filter = {}

  if (req.query.category) {
    filter.category_id = req.query.category
  }

  if (req.query.brand) {
    filter.brand_id = req.query.brand
  }

  if (req.query.status) {
    filter.status = req.query.status
  }

  return filter
}
