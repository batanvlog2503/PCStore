module.exports = (req) => {
  const filter = {
    status: {
      $ne: "deleted",
    },
  }

  // Search
  if (req.query.search?.trim()) {
    filter.name = {
      $regex: req.query.search.trim(),
      $options: "i",
    }
  }

  // Status
  if (req.query.status && req.query.status !== "all") {
    filter.status = req.query.status
  }

  // Category
  if (
    req.query.category &&
    req.query.category !== "all" &&
    req.query.category !== "Tất cả danh mục"
  ) {
    filter.category_id = req.query.category
  }

  return filter
}
