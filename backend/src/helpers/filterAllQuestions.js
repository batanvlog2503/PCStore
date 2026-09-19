module.exports = (req) => {
  const filter = {}

  const { search, status } = req.query

  // =========================
  // SEARCH USERNAME / EMAIL
  // =========================
  if (search) {
    filter.$or = [
      {
        "user_id.username": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "user_id.email": {
          $regex: search,
          $options: "i",
        },
      },
    ]
  }

  // =========================
  // STATUS
  // =========================
  if (status) {
    filter.status = status
  }

  return filter
}
