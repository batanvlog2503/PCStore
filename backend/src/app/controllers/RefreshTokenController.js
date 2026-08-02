const RefreshToken = require("../models/RefreshToken")
const RefreshTokenService = require("../services/RefreshTokenService")

class RefreshTokenController {
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body

      const result = await RefreshTokenService.deleteToken(
        req.user._id,
        refreshToken,
      )

      return res.status(200).json({
        success: true,
        message: result.message,
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new RefreshTokenController()
