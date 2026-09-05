module.exports = (req) => {
  const filter = {}

  const { search, role, status } = req.query

  if (search) {
    filter.$or = [
      {
        username: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
    ]
  }
  if (role) {
    filter.role = role
  }

  // =========================
  // STATUS
  // =========================
  if (status) {
    filter.status = status
  }

  return filter
}
