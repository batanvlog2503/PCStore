const userRoute = require("./user")
const authRoute = require("./auth")
const addressRoute = require("./address")
function route(app) {
  app.use("/user", userRoute)
  app.use("/auth", authRoute)
  app.use("/address", addressRoute)
}

module.exports = route
