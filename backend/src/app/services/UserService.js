const UserRepo = require("../repositories/UserRepository")
const AppError = require("../utils/AppError")
const bcrypt = require("bcrypt")
const User = require("../models/User")
// AppError(status, message)
class UserService {
  async getAllUsers() {
    const users = await UserRepo.findAllUsers()

    return { users }
  }

  async getUserById(id) {
    if (!id) {
      throw new AppError(400, "ID is required")
    }
    const user = await UserRepo.findUserById(id)
    if (!user) {
      throw new AppError(404, "User not found")
    }

    return { user }
  }

  async createUser(data) {
    const { username, email, password, phone } = data
    if (!email || !password || !phone || !username) {
      throw new AppError(400, "Missing required fields")
    }

    const existingUser = await UserRepo.findByEmail(email)

    if (existingUser) {
      throw new AppError(409, "Email already exists")
    }
    const hashPassword = await bcrypt.hash(password, 10)

    const user = new User({
      username,
      email,
      phone,
      password: hashPassword,
    })

    const userData = await user.save()

    return userData
  }

  async userLogin(data) {
    const { email, password } = data
    if (!email || !password) {
      throw new AppError("400", "Email or password are required !!! ")
    }

    const user = await UserRepo.findByEmail(email)

    if (!user) {
      throw new AppError("400", "User doesn't exists")
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      throw new AppError("400", "Invalid Password")
    }

    return user
  }
  async getUserByEmail(email) {
    if (!email) {
      throw new AppError("400", "Invalid Email")
    }

    const user = await UserRepo.findByEmail(email)
    if (!user) {
      throw new AppError("404", "Email doesn't exists")
    }

    return user
  }
}

module.exports = new UserService()
