const userRoute = require("./user")
const authRoute = require("./auth")

const categoryRoute = require("./category")
const addressRoute = require("./address")
const brandRoute = require("./brand")
function route(app) {
  console.log("Category route mounted")

  app.use("/category", categoryRoute)
  app.use("/user", userRoute)
  app.use("/auth", authRoute)
  app.use("/address", addressRoute)
  app.use("/brand", brandRoute)
}

module.exports = route
