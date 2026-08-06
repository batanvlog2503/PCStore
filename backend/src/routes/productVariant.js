const express = require("express")
const auth = require("../app/middlewares/auth")
const {
  addProductVariantValidator,
} = require("../helpers/validationProductVariant")
const router = express.Router()

const ProductVariantController = require("../app/controllers/ProductVariantController")

router.get("/all", auth, ProductVariantController.getAllVariants)
router.get(
  "/product/:productId",
  auth,
  ProductVariantController.getVariantsByProduct,
)
router.post(
  "/add",
  auth,
  addProductVariantValidator,
  ProductVariantController.addVariant,
)
module.exports = router
