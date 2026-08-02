const express = require("express")

const auth = require("../app/middlewares/auth")
const router = express.Router()
const UserController = require("../app/controllers/UserController")
const RefreshTokenController = require("../app/controllers/RefreshTokenController")
router.post("/register", UserController.register)
router.post("/login", UserController.login)
router.post("/logout", auth, RefreshTokenController.logout)
router.post("/refresh-token", UserController.refreshToken)
module.exports = router
