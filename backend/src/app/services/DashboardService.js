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
}

module.exports = DashboardService
