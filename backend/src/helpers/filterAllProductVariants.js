const mongoose = require("mongoose")

module.exports = (req) => {
  const filter = {}

  const {
    useCase,
    brand,
    inStock,
    minPrice,
    maxPrice,
    cpu,
    ram,
    storageCapacity,
    resolution,
    gpu,
    screenSize,
  } = req.query

  if (useCase) {
    filter.use_case = useCase
  }

  if (brand && mongoose.Types.ObjectId.isValid(brand)) {
    filter["product.brand_id"] = new mongoose.Types.ObjectId(brand)
  }

  if (inStock === "1" || inStock === "true") {
    // sẵn hàng
    filter.stock = {
      $gt: 0,
    }
  }

  if (minPrice || maxPrice) {
    filter.price = {}

    if (minPrice) {
      filter.price.$gte = Number(minPrice)
    }

    if (maxPrice) {
      filter.price.$lte = Number(maxPrice)
    }
  }

  if (cpu) {
    filter["specs.cpu"] = {
      $regex: cpu,
      $options: "i",
    }
  }

  if (ram) {
    filter["specs.ram"] = Number(ram)
  }

  if (storageCapacity) {
    filter["specs.storage_capacity"] = Number(storageCapacity)
  }

  if (resolution) {
    filter["specs.screen_resolution"] = resolution
  }

  if (gpu) {
    filter["specs.gpu"] = {
      $regex: gpu,
      $options: "i",
    }
  }

  if (screenSize) {
    filter["specs.screen_size"] = Number(screenSize)
  }

  return filter
}
