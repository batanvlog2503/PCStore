const userRoute = require("./user")
const authRoute = require("./auth")
const productVariant = require("./productVariant")
const categoryRoute = require("./category")
const addressRoute = require("./address")
const brandRoute = require("./brand")
const productRoute = require("./product")
const productImageRoute = require("./productImage")
const cartRoute = require("./cart")
function route(app) {
  console.log("Category route mounted")

  app.use("/category", categoryRoute)
  app.use("/user", userRoute)
  app.use("/auth", authRoute)
  app.use("/address", addressRoute)
  app.use("/brand", brandRoute)
  app.use("/product", productRoute)
  app.use("/product-image", productImageRoute)
  app.use("/product-variant", productVariant)
  app.use("/cart", cartRoute)
}

module.exports = route
