const express = require("express")
const auth = require("../app/middlewares/auth")
const router = express.Router()

const AddressController = require("../app/controllers/AddressController")
router.get("/all", AddressController.getAllAddresses)
router.get("/my-address", AddressController.getMyAddress)
router.post("/add", AddressController.addAddress)
router.delete("/delete/:id", AddressController.deleteAddress)
router.patch("/:id/default", AddressController.setDefaultAddress)
router.put("/update/:id", AddressController.updateAddress)
module.exports = router
