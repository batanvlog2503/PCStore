module.exports = (req) => {
  const sort = {}

  const column = req.query.sort
  const order = req.query.order

  const validFields = ["name", "created_at", "rating_avg", "sold_count"]

  const validOrders = ["asc", "desc"]

  if (validFields.includes(column) && validOrders.includes(order)) {
    sort[column] = order === "asc" ? 1 : -1
  }

  return sort
}
