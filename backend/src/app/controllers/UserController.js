const { validationResult } = require("express-validator")
const UserService = require("../services/UserService")

const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

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
}

module.exports = new UserController()
