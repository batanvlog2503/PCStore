module.exports = (req, userIds = null) => {
  const filter = {}

  const { status } = req.query

  // Search theo User
  if (userIds) {
    filter.user_id = {
      $in: userIds,
    }
  }

  // Search theo status
  if (status) {
    filter.status = status
  }

  return filter
}
