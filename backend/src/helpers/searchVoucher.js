module.exports = (req) => {
  const search = {}

  const keyword = req.query.search?.trim() //query se là ?search=lenovo

  if (keyword) {
    search.name = {
      $regex: keyword,
      $options: "i", // không phân biệt hoa thường
    }
  }

  return search
}
