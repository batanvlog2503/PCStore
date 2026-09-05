const DashboardRepo = require("../repositories/DashboardRepository")
const DashboardService = {
  async getDashboard() {
    const dashboard = await DashboardRepo.getDashboard()

    return dashboard
  },

  constructor(dashboardRepository) {
    this.dashboardRepository = dashboardRepository
  },
  fillMissingDates(data, startDate, endDate, field) {
    const dataMap = new Map()

    data.forEach((item) => {
      dataMap.set(item.date, item[field])
    })

    const result = []

    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateString = currentDate.toLocaleDateString("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
      })

      result.push({
        date: dateString,
        [field]: dataMap.get(dateString) || 0,
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return result
  },

  async getRevenueChart() {
    const endDate = new Date()

    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 6)

    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    const data = await DashboardRepo.getRevenueChart(startDate, endDate)

    return this.fillMissingDates(data, startDate, endDate, "revenue")
  },
  async getOrdersChart() {
    const endDate = new Date()

    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 6)

    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    const data = await DashboardRepo.getOrdersChart(startDate, endDate)

    return this.fillMissingDates(data, startDate, endDate, "orders")
  },

  async getOrderStatusChartService() {
    const statuses = await DashboardRepo.getOrderStatusStatistics()

    const totalOrders = statuses.reduce((total, item) => total + item.count, 0)

    const statusConfig = {
      pending: {
        label: "Chờ xác nhận",
        color: "#f5a623",
      },

      shipping: {
        label: "Đang giao",
        color: "#2f6fed",
      },

      completed: {
        label: "Hoàn thành",
        color: "#22c55e",
      },

      cancelled: {
        label: "Đã huỷ",
        color: "#ef4444",
      },
    }

    const result = Object.entries(statusConfig).map(([status, config]) => {
      const found = statuses.find((item) => item._id === status)

      const value = found ? found.count : 0

      const percent =
        totalOrders > 0 ? Math.round((value / totalOrders) * 100) : 0

      return {
        status,
        label: config.label,
        value,
        percent,
        color: config.color,
      }
    })

    return result
  },

  async getLatestProducts(page, limit) {
    return await DashboardRepo.getLatestProducts(page, limit)
  },
}

module.exports = DashboardService
