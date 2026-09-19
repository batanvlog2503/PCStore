const express = require("express")
const auth = require("../app/middlewares/auth")

const router = express.Router()

const CategoryController = require("../app/controllers/CategoryController")
router.get("/", CategoryController.getAllCategories)
router.get("/test", CategoryController.test)
router.get("/all", CategoryController.getAllTreeCategories)
router.get("/:slug", CategoryController.getCategoryBySlug)
router.post("/add", CategoryController.createCategory)
router.put("/update/:id", CategoryController.updateCategory)
router.delete("/delete/:id", CategoryController.deleteCategory)

module.exports = router
