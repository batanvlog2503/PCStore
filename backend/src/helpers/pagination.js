module.exports = (req) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1)
  const limit = Math.max(parseInt(req.query.limit) || 5, 1)

  const skip = (page - 1) * limit

  return {
    page,
    limit,
    skip,
  }
}
