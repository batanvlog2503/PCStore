const router = require("express").Router()
const auth = require("../app/middlewares/auth")
const WishlistController = require("../app/controllers/WishlistController")
const authorize = require("../app/middlewares/authorize")
router.post("/add/:productId", auth, authorize("user"), WishlistController.add)

router.delete(
  "/remove/:productId",
  auth,
  authorize("user"),
  WishlistController.remove,
)

router.get(
  "/check/:productId",
  auth,
  authorize("user"),
  WishlistController.check,
)

router.get("/all", auth, authorize("user"), WishlistController.getAll)

module.exports = router
