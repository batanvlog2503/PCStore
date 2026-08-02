const express = require("express")
const auth = require("../app/middlewares/auth")
const router = express.Router()

const AddressController = require("../app/controllers/AddressController")
router.get("/all", auth, AddressController.getAllAddresses)
router.post("/add", auth, AddressController.addAddress)
router.delete("/delete/:id", auth, AddressController.deleteAddress)
router.patch("/:id/default", auth, AddressController.setDefaultAddress)
router.put("/update/:id", auth, AddressController.updateAddress)
module.exports = router
