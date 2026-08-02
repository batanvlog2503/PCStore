const RefreshToken = require("../models/RefreshToken")
class RefreshTokenRepository {
  async findToken(userId, refreshToken) {
    return await RefreshToken.findOne({
      user_id: userId,
      refreshToken,
    })
  }

  async deleteToken(userId, refreshToken) {
    return await RefreshToken.deleteOne({
      user_id: userId,
      refreshToken,
    })
  }
}

module.exports = new RefreshTokenRepository()
