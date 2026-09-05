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
    const { startOfThisWeek, startOfLastWeek } = getWeekRange()

    // =========================
    // 1. REVENUE + COMPLETED ORDERS
    // =========================

    const orderResult = await Order.aggregate([
      {
        $match: {
          status: "completed",
        },
      },

      {
        $group: {
          _id: null,

          // Tổng doanh thu của tất cả đơn hoàn thành
          totalRevenue: {
            $sum: "$total_amount",
          },

          // Tổng số đơn hoàn thành
          totalOrders: {
            $sum: 1,
          },

          // =========================
          // TUẦN NÀY
          // =========================

          revenueThisWeek: {
            $sum: {
              $cond: [
                {
                  $gte: ["$completed_at", startOfThisWeek],
                },
                "$total_amount",
                0,
              ],
            },
          },

          ordersThisWeek: {
            $sum: {
              $cond: [
                {
                  $gte: ["$completed_at", startOfThisWeek],
                },
                1,
                0,
              ],
            },
          },

          // =========================
          // TUẦN TRƯỚC
          // =========================

          revenueLastWeek: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $gte: ["$completed_at", startOfLastWeek],
                    },
                    {
                      $lt: ["$completed_at", startOfThisWeek],
                    },
                  ],
                },
                "$total_amount",
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
                      $gte: ["$completed_at", startOfLastWeek],
                    },
                    {
                      $lt: ["$completed_at", startOfThisWeek],
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

    const orderData = orderResult[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      revenueThisWeek: 0,
      revenueLastWeek: 0,
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

          // Tổng tất cả khách hàng
          totalCustomers: {
            $sum: 1,
          },

          // Khách hàng đăng ký tuần này
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

          // Khách hàng đăng ký tuần trước
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

          // Tổng sản phẩm đang hoạt động
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

    // Tạm thời vì chưa có Review model
    const newReviews = 15

    // =========================
    // 5. RETURN
    // =========================

    return {
      // Tổng toàn bộ hệ thống
      totalRevenue: orderData.totalRevenue,

      // Chỉ tính đơn completed
      totalOrders: orderData.totalOrders,

      // Tổng khách hàng
      totalCustomers: customerData.totalCustomers,

      // Tổng sản phẩm active
      totalProducts: productData.totalProducts,

      newReviews,

      // % thay đổi tuần này so với tuần trước
      changes: {
        revenue: calculateChange(
          orderData.revenueThisWeek,
          orderData.revenueLastWeek,
        ),

        orders: calculateChange(
          orderData.ordersThisWeek,
          orderData.ordersLastWeek,
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

  async getOrderStatusStatistics() {
    return await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ])
  },

  async getLatestProducts(page = 1, limit = 5) {
    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      Product.find({
        status: "active",
      })
        .sort({
          created_at: -1,
        })
        .skip(skip)
        .limit(limit)
        .populate("brand_id", "name")
        .populate("category_id", "name")
        .lean(),

      Product.countDocuments({
        status: "active",
      }),
    ])

    return {
      products,

      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  },
  async getTopProducts(limit = 5) {
    return await Product.find({
      status: "active",
    })
      .sort({
        sold_count: -1,
      })
      .limit(Number(limit))
      .populate("brand_id", "name")
      .populate("category_id", "name")
      .lean()
  },
}

module.exports = DashboardRepository
