const express = require("express")
const auth = require("../app/middlewares/auth")
const router = express.Router()

const AddressController = require("../app/controllers/AddressController")
const authorize = require("../app/middlewares/authorize")
router.get("/all", auth, authorize("user"), AddressController.getAllAddresses)
router.get(
  "/my-address",
  auth,
  authorize("user"),
  AddressController.getMyAddress,
)
router.post("/add", auth, authorize("user"), AddressController.addAddress)
router.delete(
  "/delete/:id",
  auth,
  authorize("user"),
  AddressController.deleteAddress,
)
router.patch(
  "/:id/default",
  auth,
  authorize("user"),
  AddressController.setDefaultAddress,
)
router.put(
  "/update/:id",
  auth,
  authorize("user"),
  AddressController.updateAddress,
)
module.exports = router
