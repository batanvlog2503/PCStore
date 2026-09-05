const DashboardService = require("../services/DashboardService")

const DashboardController = {
  async getDashboard(req, res, next) {
    try {
      const data = await DashboardService.getDashboard()

      return res.status(200).json({
        message: "Get Dashboard Successfully",
        success: true,
        data,
      })
    } catch (error) {
      next(error)
    }
  },
  async getRevenueChart(req, res, next) {
    try {
      const data = await DashboardService.getRevenueChart()

      return res.status(200).json({
        success: true,
        message: "Get revenue chart  successfully !!!",
        data,
      })
    } catch (error) {
      next(error)
    }
  },

  async getOrdersChart(req, res, next) {
    try {
      const data = await DashboardService.getOrdersChart()

      return res.status(200).json({
        success: true,
        message: "Get orders successfully !!!",
        data,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  },
}

module.exports = DashboardController
