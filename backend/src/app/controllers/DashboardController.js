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
      next(error)
    }
  },

  async getOrderStatusChart(req, res, next) {
    try {
      const data = await DashboardService.getOrderStatusChartService()

      return res.status(200).json({
        success: true,
        message: "get order statistic successfully !!!",
        data,
      })
    } catch (error) {
      next(error)
    }
  },

  async getLatestProducts(req, res) {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 5

      const data = await DashboardService.getLatestProducts(page, limit)

      return res.status(200).json({
        success: true,
        message: "Get latest products successfully",
        data,
      })
    } catch (error) {
      next(error)
    }
  },

  async getTopProducts(req, res, next) {
    try {
      const { limit = 5 } = req.query

      const products = await DashboardService.getTopProducts(limit)

      return res.status(200).json({
        success: true,
        message: "Get top products successfully",
        products,
      })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = DashboardController
