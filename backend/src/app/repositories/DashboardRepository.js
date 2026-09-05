const Order = require("../models/Order")
const User = require("../models/User")
const Product = require("../models/Product")

const getWeekRange = () => {
  const now = new Date()

  // Thứ 2 đầu tuần
  const startOfThisWeek = new Date(now)
  const day = startOfThisWeek.getDay()

  const diff = day === 0 ? 6 : day - 1

  startOfThisWeek.setDate(startOfThisWeek.getDate() - diff)
  startOfThisWeek.setHours(0, 0, 0, 0)

  // Thứ 2 tuần trước
  const startOfLastWeek = new Date(startOfThisWeek)
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)

  // Chủ nhật cuối tuần trước
  const endOfLastWeek = new Date(startOfThisWeek)
  endOfLastWeek.setMilliseconds(-1)

  return {
    startOfThisWeek,
    startOfLastWeek,
    endOfLastWeek,
  }
}

const calculateChange = (thisWeek, lastWeek) => {
  if (lastWeek === 0) {
    return thisWeek > 0 ? 100 : 0
  }

  return Number((((thisWeek - lastWeek) / lastWeek) * 100).toFixed(1))
}

const DashboardRepository = {
  async getDashboard() {
    const { startOfThisWeek, startOfLastWeek, endOfLastWeek } = getWeekRange()

    // =========================
    // 1. REVENUE
    // =========================

    const revenueResult = await Order.aggregate([
      {
        $match: {
          status: { $ne: "cancelled" },
          created_at: {
            $gte: startOfLastWeek,
          },
        },
      },
      {
        $group: {
          _id: null,

          totalRevenue: {
            $sum: "$total_amount",
          },

          revenueThisWeek: {
            $sum: {
              $cond: [
                {
                  $gte: ["$created_at", startOfThisWeek],
                },
                "$total_amount",
                0,
              ],
            },
          },

          revenueLastWeek: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $gte: ["$created_at", startOfLastWeek],
                    },
                    {
                      $lt: ["$created_at", startOfThisWeek],
                    },
                  ],
                },
                "$total_amount",
                0,
              ],
            },
          },

          totalOrders: {
            $sum: 1,
          },

          ordersThisWeek: {
            $sum: {
              $cond: [
                {
                  $gte: ["$created_at", startOfThisWeek],
                },
                1,
                0,
              ],
            },
          },

          ordersLastWeek: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $gte: ["$created_at", startOfLastWeek],
                    },
                    {
                      $lt: ["$created_at", startOfThisWeek],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ])

    const revenueData = revenueResult[0] || {
      totalRevenue: 0,
      revenueThisWeek: 0,
      revenueLastWeek: 0,
      totalOrders: 0,
      ordersThisWeek: 0,
      ordersLastWeek: 0,
    }

    // =========================
    // 2. CUSTOMERS
    // =========================

    const customerResult = await User.aggregate([
      {
        $match: {
          role: "user",
        },
      },
      {
        $group: {
          _id: null,

          totalCustomers: {
            $sum: 1,
          },

          customersThisWeek: {
            $sum: {
              $cond: [
                {
                  $gte: ["$created_at", startOfThisWeek],
                },
                1,
                0,
              ],
            },
          },

          customersLastWeek: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $gte: ["$created_at", startOfLastWeek],
                    },
                    {
                      $lt: ["$created_at", startOfThisWeek],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ])

    const customerData = customerResult[0] || {
      totalCustomers: 0,
      customersThisWeek: 0,
      customersLastWeek: 0,
    }

    // =========================
    // 3. PRODUCTS
    // =========================

    const productResult = await Product.aggregate([
      {
        $match: {
          status: "active",
        },
      },
      {
        $group: {
          _id: null,

          totalProducts: {
            $sum: 1,
          },

          productsThisWeek: {
            $sum: {
              $cond: [
                {
                  $gte: ["$created_at", startOfThisWeek],
                },
                1,
                0,
              ],
            },
          },

          productsLastWeek: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $gte: ["$created_at", startOfLastWeek],
                    },
                    {
                      $lt: ["$created_at", startOfThisWeek],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ])

    const productData = productResult[0] || {
      totalProducts: 0,
      productsThisWeek: 0,
      productsLastWeek: 0,
    }

    // =========================
    // 4. REVIEWS
    // =========================

    // Chưa có Review model
    const newReviews = 15

    // =========================
    // 5. RETURN
    // =========================

    return {
      totalRevenue: revenueData.totalRevenue,
      totalOrders: revenueData.totalOrders,
      totalCustomers: customerData.totalCustomers,
      totalProducts: productData.totalProducts,
      newReviews,

      changes: {
        revenue: calculateChange(
          revenueData.revenueThisWeek,
          revenueData.revenueLastWeek,
        ),

        orders: calculateChange(
          revenueData.ordersThisWeek,
          revenueData.ordersLastWeek,
        ),

        customers: calculateChange(
          customerData.customersThisWeek,
          customerData.customersLastWeek,
        ),

        products: calculateChange(
          productData.productsThisWeek,
          productData.productsLastWeek,
        ),

        reviews: 0,
      },
    }
  },
  // DOANH THU 7 NGÀY GẦN NHẤT
  // ==============================
  async getRevenueChart(startDate, endDate) {
    return await Order.aggregate([
      {
        $match: {
          status: "completed",
          completed_at: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$completed_at",
              timezone: "Asia/Ho_Chi_Minh",
            },
          },
          revenue: {
            $sum: "$total_amount",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          revenue: 1,
        },
      },
    ])
  },

  async getOrdersChart(startDate, endDate) {
    return await Order.aggregate([
      {
        $match: {
          created_at: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$created_at",
              timezone: "Asia/Ho_Chi_Minh",
            },
          },

          orders: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },

      {
        $project: {
          _id: 0,
          date: "$_id",
          orders: 1,
        },
      },
    ])
  },
}

module.exports = DashboardRepository
