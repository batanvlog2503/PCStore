module.exports = (req) => {
  const filter = {}

  if (req.query.status) {
    filter.status = req.query.status
  }

  return filter
}
