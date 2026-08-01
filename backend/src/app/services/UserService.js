const UserRepo = require("../repositories/UserRepository")
const AppError = require("../utils/AppError")
const bcrypt = require("bcrypt")
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
    if (!data.email || !data.password || !data.phone || !data.username) {
      throw new AppError(400, "Missing required fields")
    }

    const existingUser = await UserRepo.findByEmail(data.email)

    if (existingUser) {
      throw new AppError(409, "Email already exists")
    }

    const newUser = await UserRepo.createUser(data)

    return newUser
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
