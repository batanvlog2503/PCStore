const { validationResult } = require("express-validator")
const UserService = require("../services/UserService")

const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const RefreshToken = require("../models/RefreshToken")

class UserController {
  async getAllUsers(req, res, next) {
    try {
      const users = await UserService.getAllUsers()

      return res.status(200).json({
        success: true,
        message: "Get All Users Successfully !!!",
        total: users.length,
        users,
      })
    } catch (error) {
      next(error)
    }
  }
  async register(req, res, next) {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        })
      }

      const userData = await UserService.createUser(req.body)

      return res.status(201).json({
        success: true,
        message: "Register Successfully",
        user: userData,
      })
    } catch (error) {
      next(error)
    }
  }

  async login(req, res, next) {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        })
      }
      const data = req.body
      const response = await UserService.userLogin(data)
      return res.status(201).json({
        success: true,
        message: "Login Successfully",
        ...response,
      })
    } catch (error) {
      next(error)
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Refresh Token Expired !!! ",
        })
      }
      console.log(`RefreshToken: ${refreshToken}`)

      // kiểm tra refreshToken có trong db chưa
      const tokenInDB = await RefreshToken.findOne({
        refreshToken: refreshToken,
      })

      if (!tokenInDB) {
        return res.status(403).json({
          success: false,
          message: "Invalid Refresh Token !!!",
        })
      }

      // verify refreshToken
      // xác minh xem refreshToken còn sử dụng được không
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

      // Tìm user thông qua decoded
      console.log("Decoded: ", JSON.stringify(decoded))

      const userData = await User.findById(decoded._id).lean()
      if (!userData) {
        return res.status(404).json({
          message: "User not found",
          success: false,
        })
      }
      // Xóa refresh token cũ
      await RefreshToken.deleteOne({
        refreshToken,
      })

      // Sinh refresh token mới
      const newRefreshToken = await generateRefreshToken(userData)

      // Lưu DB
      await RefreshToken.create({
        user_id: userData._id,
        refreshToken: newRefreshToken,
      })
      // tạo accessToken mới khi có user
      const newAccessToken = await generateAccessToken(userData)

      return res.status(200).json({
        success: true,
        message: "Generate new AccessToken Successfully !!! ",
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      })
    } catch (error) {
      next(error)
    }
  }

  async profile(req, res, next) {
    const user = req.user
    console.log(req.user)
    return res.status(200).json({
      message: "Get Profile Successfully !!! ",
      success: true,
      user,
    })
  }
}

module.exports = new UserController()
