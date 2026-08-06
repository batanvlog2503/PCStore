const express = require("express")
const multer = require("multer")
const path = require("path")
const auth = require("../app/middlewares/auth")
const router = express.Router()
const ProductImageController = require("../app/controllers/ProductImageController")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const typeFile = ["image/jpeg", "image/jpg", "image/png"]
    if (typeFile.includes(file.mimetype)) {
      cb(null, path.join(__dirname, "../public/product"))
    } else {
      cb(new Error("Invalid file"))
    }
  },
  filename: function (req, file, cb) {
    const name = "product" + Date.now() + "-" + file.originalname
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
router.get("/:productId", auth, ProductImageController.getAllImages)
router.post(
  "/add",
  auth,
  upload.array("image_url", 10),
  ProductImageController.addImages,
)
router.put(
  "/update/:productId",
  auth,
  upload.single("image_url"),
  ProductImageController.updateImage,
)
router.delete("/delete/:id", auth, ProductImageController.deleteImage)
router.put("/set-main/:id", auth, ProductImageController.setMainImage)
module.exports = router
