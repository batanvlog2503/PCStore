const express = require("express")
const auth = require("../app/middlewares/auth")
const router = express.Router()
const UserController = require("../app/controllers/UserController")

router.get("/all", auth, UserController.getAllUsers)
router.get("/me", auth, UserController.profile)
module.exports = router
