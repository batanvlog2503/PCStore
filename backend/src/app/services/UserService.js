const UserRepo = require("../repositories/UserRepository")
const AppError = require("../utils/AppError")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const RefreshToken = require("../models/RefreshToken")
// AppError(status, message)

const generateAccessToken = async (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "8h" })
}
const generateRefreshToken = async (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "3d" })
}
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
  async adminAddUser(data) {
    const {
      username,
      email,
      password,
      phone,
      role = "user",
      status = "active",
    } = data

    if (!username) {
      throw new AppError(400, "Username is required")
    }

    if (!email) {
      throw new AppError(400, "Email is required")
    }

    if (!password) {
      throw new AppError(400, "Password is required")
    }

    const existingUsername = await UserRepo.findUserByUsername(username)

    if (existingUsername) {
      throw new AppError(400, "Username already exists")
    }

    const existingEmail = await UserRepo.findByEmail(email)

    if (existingEmail) {
      throw new AppError(400, "Email already exists")
    }

    if (phone) {
      const existingPhone = await UserRepo.findByPhone(phone)

      if (existingPhone) {
        throw new AppError(400, "Phone already exists")
      }
    }

    const allowedRoles = ["user", "admin"]

    if (!allowedRoles.includes(role)) {
      throw new AppError(400, "Role is invalid")
    }

    const allowedStatus = ["active", "inactive", "blocked"]

    if (!allowedStatus.includes(status)) {
      throw new AppError(400, "Status is invalid")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await UserRepo.createUser({
      username,
      email,
      password: hashedPassword,
      phone: phone || undefined,
      role,
      status,
    })

    // Không trả password về frontend
    const userObject = user.toObject()
    delete userObject.password

    return userObject
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

    await RefreshToken.deleteMany({ user_id: user._id })

    const accessToken = await generateAccessToken(user.toObject())
    const refreshToken = await generateRefreshToken(user.toObject())
    console.log("Token Login: ", accessToken)

    // tạo refreshToken
    await RefreshToken.create({
      user_id: user._id,
      refreshToken: refreshToken,
    })

    return {
      user,
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      createAt: new Date(),
    }
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

  async updateUser(id, data) {
    if (!id) {
      throw new AppError(400, "User id not found")
    }

    const { username, phone } = data
    const user = await UserRepo.findUserById(id)

    if (!user) {
      throw new AppError(404, "Không tìm thấy người dùng")
    }

    const updateData = {}

    if (username !== undefined) {
      const newUsername = username.trim()

      if (!newUsername) {
        throw new AppError(400, "Tên đăng nhập không được để trống")
      }

      // Chỉ check trùng nếu username thay đổi
      if (newUsername !== user.username) {
        const usernameExists = await UserRepo.findUserByUsername(newUsername)

        if (usernameExists) {
          throw new AppError(400, "Tên đăng nhập đã tồn tại")
        }
      }

      updateData.username = newUsername
    }

    if (phone !== undefined) {
      const newPhone = phone.trim()

      // Phone có thể để trống
      if (newPhone) {
        // Chỉ check nếu phone thay đổi
        if (newPhone !== user.phone) {
          const phoneExists = await UserRepo.findByPhone(newPhone)

          if (phoneExists) {
            throw new AppError(400, "Số điện thoại đã tồn tại")
          }
        }

        updateData.phone = newPhone
      } else {
        updateData.phone = null
      }
    }

    const updatedUser = await UserRepo.updateUser(id, updateData)

    return updatedUser
  }

  async filterAllUsers(req) {
    return await UserRepo.filterAllUsers(req)
  }

  async getUserStats() {
    return await UserRepo.getUserStats()
  }

  async updateUserStatus(id, status) {
    if (!id) {
      throw new AppError(400, "Không tìm thấy ID người dùng")
    }

    if (!status) {
      throw new AppError(400, "Trạng thái không được để trống")
    }

    const allowedStatus = ["active", "inactive", "blocked"]

    if (!allowedStatus.includes(status)) {
      throw new AppError(400, "Trạng thái không hợp lệ")
    }

    // Tìm user
    const user = await UserRepo.findUserById(id)

    if (!user) {
      throw new AppError(404, "Không tìm thấy người dùng")
    }

    // Không nên tự khóa chính tài khoản admin hiện tại
    // Phần này có thể nâng cấp sau nếu truyền req.user vào service

    const updatedUser = await UserRepo.updateUser(id, {
      status,
    })

    return updatedUser
  }
  async updateUser(id, data) {
    if (!id) {
      throw new AppError(400, "User id not found")
    }

    const { username, phone } = data

    const user = await UserRepo.findUserById(id)

    if (!user) {
      throw new AppError(404, "Không tìm thấy người dùng")
    }

    const updateData = {}

    if (username !== undefined) {
      const newUsername = username.trim()

      if (!newUsername) {
        throw new AppError(400, "Tên đăng nhập không được để trống")
      }

      // Chỉ check trùng nếu username thay đổi
      if (newUsername !== user.username) {
        const usernameExists = await UserRepo.findUserByUsername(newUsername)

        if (usernameExists) {
          throw new AppError(400, "Tên đăng nhập đã tồn tại")
        }
      }

      updateData.username = newUsername
    }

    if (phone !== undefined) {
      const newPhone = phone.trim()

      // Phone có thể để trống
      if (newPhone) {
        // Chỉ check nếu phone thay đổi
        if (newPhone !== user.phone) {
          const phoneExists = await UserRepo.findByPhone(newPhone)

          if (phoneExists) {
            throw new AppError(400, "Số điện thoại đã tồn tại")
          }
        }

        updateData.phone = newPhone
      } else {
        updateData.phone = null
      }
    }

    const updatedUser = await UserRepo.updateUser(id, updateData)

    return updatedUser
  }
}

module.exports = new UserService()
