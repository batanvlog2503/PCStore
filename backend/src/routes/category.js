const express = require("express")
const auth = require("../app/middlewares/auth")

const router = express.Router()

const CategoryController = require("../app/controllers/CategoryController")
router.get("/", auth, CategoryController.getAllCategories)
router.get("/test", auth, CategoryController.test)
router.get("/all", auth, CategoryController.getAllTreeCategories)
router.get("/:slug", auth, CategoryController.getCategoryBySlug)
router.post("/add", auth, CategoryController.createCategory)
router.put("/update/:id", auth, CategoryController.updateCategory)
router.delete("/delete/:id", auth, CategoryController.deleteCategory)

module.exports = router
