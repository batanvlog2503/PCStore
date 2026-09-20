const express = require("express")
const auth = require("../app/middlewares/auth")

const router = express.Router()

const CategoryController = require("../app/controllers/CategoryController")

router.get("/test", CategoryController.test)

router.get("/:slug", CategoryController.getCategoryBySlug)

router.put("/update/:id", CategoryController.updateCategory)
router.delete("/delete/:id", CategoryController.deleteCategory)

module.exports = router
