const express = require("express")
const router = express.Router()
const auth = require("../app/middlewares/auth")
const BrandController = require("../app/controllers/BrandController")
const multer = require("multer")

const path = require("path")
const {
  addBrandValidator,
  updateBrandValidator,
} = require("../helpers/validationBrand")
const authorize = require("../app/middlewares/authorize")
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const typeFile = ["image/jpeg", "image/jpg", "image/png"]

    if (typeFile.includes(file.mimetype)) {
      cb(null, path.join(__dirname, "../public/brand"))
    } else {
      cb(new Error("Invalid file"))
    }
  },
  filename: function (req, file, cb) {
    const name = "brand" + Date.now() + "-" + file.originalname
    cb(null, name)
  },
})

const fileFilter = (req, file, cb) => {
  const typeFile = ["image/jpeg", "image/png", "image/jpg"]
  if (typeFile.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Chỉ cho phép upload file ảnh"), false)
  }
}

const upload = multer({ storage: storage, fileFilter: fileFilter })

router.get("/admin/all", BrandController.getAllBrands)
router.post(
  "/admin/add",
  auth,
  authorize("admin", "user"),
  upload.single("logo_url"),
  addBrandValidator,
  BrandController.addBrand,
)
router.put(
  "/admin/update/:id",
  auth,
  upload.single("logo_url"),
  updateBrandValidator,
  BrandController.updateBrand,
)
router.delete("/admin/delete/:id", auth, BrandController.deleteBrand)
module.exports = router
