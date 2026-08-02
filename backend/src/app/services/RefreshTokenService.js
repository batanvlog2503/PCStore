const RefreshTokenRepo = require("../repositories/RefreshTokenRepository")

const User = require("../models/User")

class RefreshTokenService {
  async findToken(userId, refreshToken) {
    if (!userId || !refreshToken) {
      throw new Error("Missing userId or refreshToken")
    }

    const user = await User.findById(userId)
    if (!user) {
      throw new Error("User not found")
    }

    const token = await RefreshTokenRepo.findToken(userId, refreshToken)
    if (!token) {
      throw new Error("Token not found")
    }
    return token
  }

  async deleteToken(userId, refreshToken) {
    if (!userId || !refreshToken) {
      throw new Error("Missing userId or refreshToken")
    }
    const user = await User.findById(userId)
    if (!user) {
      throw new Error("User not found")
    }
    const token = await RefreshTokenRepo.deleteToken(userId, refreshToken)
    if (!token) {
      throw new Error("Token not found")
    }
    return {
      message: "Logout successfully",
    }
  }
}
module.exports = new RefreshTokenService()
