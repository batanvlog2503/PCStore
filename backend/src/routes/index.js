const userRoute = require("./user")
const authRoute = require("./auth")

const categoryRoute = require("./category")
const addressRoute = require("./address")
const brandRoute = require("./brand")
const productRoute = require("./product")
const productImageRoute = require("./productImage")
function route(app) {
  console.log("Category route mounted")

  app.use("/category", categoryRoute)
  app.use("/user", userRoute)
  app.use("/auth", authRoute)
  app.use("/address", addressRoute)
  app.use("/brand", brandRoute)
  app.use("/product", productRoute)
  app.use("/product-image", productImageRoute)
}

module.exports = route
