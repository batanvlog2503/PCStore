const BrandService = require("../services/BrandService")
const { validationResult } = require("express-validator")
const Brand = require("../models/Brand")
const fs = require("fs") // là thư viện của nodejs làm việc với thư mục
const path = require("path")
class BrandController {
  async getAllBrands(req, res, next) {
    try {
      const brands = await BrandService.getAllBrands()

      res.status(200).json({
        success: true,
        brands,
      })
    } catch (err) {
      next(err)
    }
  }
  async getBrandById(req, res, next) {
    try {
      const brand = await BrandService.getBrandById(req.params.id)

      return res.status(200).json({
        success: true,
        brand,
        message: "Get Brand By Id Successfully",
      })
    } catch (err) {
      next(err)
    }
  }
  async addBrand(req, res, next) {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Errors req",
          errors: errors.array(),
        })
      }
      const data = {
        ...req.body,
        logo_url: req.file ? `/brand/${req.file.filename}` : "",
      }
      const brand = await BrandService.createBrand(data)

      return res.status(201).json({
        success: true,
        message: "Create brand successfully",
        brand,
      })
    } catch (err) {
      // Nếu upload rồi nhưng lỗi thì xóa file
      if (req.file) {
        fs.unlink(
          path.join(__dirname, "../../public/brand", req.file.filename),
          () => {},
        )
      }

      next(err)
    }
  }

  async updateBrand(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Errors",
          error: errors.array(),
        })
      }
      const brand = await BrandService.updateBrand(
        req.params.id,
        req.body,
        req.file,
      )

      res.status(200).json({
        success: true,
        brand,
        message: "update brand Successfully !!!",
      })
    } catch (err) {
      next(err)
    }
  }

  async deleteBrand(req, res, next) {
    try {
      const result = await BrandService.deleteBrand(req.params.id)

      res.status(200).json({
        success: true,

        ...result, // bao gồm message rồi
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new BrandController()
