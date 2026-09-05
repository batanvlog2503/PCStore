import React, { useEffect, useMemo, useState } from "react"
import "./Dashboard.scss"
import LatestProduct from "./LatestProduct.jsx"
import axiosInstance from "../../utils/axiosInstance"
import TopProducts from "./TopProducts.jsx"

const ACTIVITIES = [
  {
    text: "Đơn hàng #DH10045 đã được giao",
    time: "2 phút trước",
    icon: "fa-solid fa-circle-check",
    tone: "green",
  },
  {
    text: "Khách hàng Nguyễn Văn A đã đặt hàng",
    time: "10 phút trước",
    icon: "fa-solid fa-cart-shopping",
    tone: "blue",
  },
  {
    text: "Sản phẩm MacBook Air M3 đã được cập nhật",
    time: "25 phút trước",
    icon: "fa-solid fa-pen",
    tone: "cyan",
  },
  {
    text: "Đơn hàng #DH10044 đã bị huỷ",
    time: "30 phút trước",
    icon: "fa-solid fa-circle-xmark",
    tone: "red",
  },
]

// ================= CHART HELPERS =================
const CHART_W = 600
const CHART_H = 240
const PAD_X = 44
const PAD_TOP = 20
const PAD_BOTTOM = 34
const Y_TICKS = 4 // số vạch chia trục Y (không tính vạch 0)

// Làm tròn "đẹp" cho trục Y (vd 32.990.000 -> 35.000.000) thay vì số lẻ khó đọc
const niceMax = (value) => {
  if (!value || value <= 0) return 10
  const exponent = Math.floor(Math.log10(value))
  const magnitude = Math.pow(10, exponent)
  const residual = value / magnitude
  let niceResidual
  if (residual <= 1) niceResidual = 1
  else if (residual <= 2) niceResidual = 2
  else if (residual <= 5) niceResidual = 5
  else niceResidual = 10
  return niceResidual * magnitude
}

const formatCompact = (value) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}tr`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`
  return `${value}`
}

// An toàn với mảng rỗng (chưa có data) hoặc chỉ có 1 điểm (tránh chia cho 0)
const buildLine = (data) => {
  if (!data || data.length === 0) {
    return { points: [], linePath: "", areaPath: "", max: 0, yTicks: [] }
  }

  const rawMax = Math.max(...data)
  const max = niceMax(rawMax * 1.15) || 1

  // chỉ có 1 điểm dữ liệu -> đặt cố định ở giữa biểu đồ, không chia cho (length - 1) = 0
  const stepX =
    data.length === 1 ? 0 : (CHART_W - PAD_X * 2) / (data.length - 1)

  const points = data.map((v, i) => [
    data.length === 1 ? CHART_W / 2 : PAD_X + i * stepX,
    CHART_H - PAD_BOTTOM - (v / max) * (CHART_H - PAD_TOP - PAD_BOTTOM),
  ])

  const linePath = points
    .map(
      (p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`,
    )
    .join(" ")

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1][0]} ${CHART_H - PAD_BOTTOM} L ${points[0][0]} ${CHART_H - PAD_BOTTOM} Z`
      : ""

  // Nhãn giá trị bên trục Y (0, max/4, max/2, ...)
  const yTicks = Array.from({ length: Y_TICKS + 1 }, (_, i) => {
    const ratio = i / Y_TICKS
    const value = max * (1 - ratio)
    const y = PAD_TOP + ratio * (CHART_H - PAD_TOP - PAD_BOTTOM)
    return { y, label: formatCompact(value) }
  })

  return { points, linePath, areaPath, max, yTicks }
}

const buildBars = (data) => {
  if (!data || data.length === 0) {
    return { bars: [], yTicks: [] }
  }

  const max = 50
  const gap = 14

  const barW = (CHART_W - PAD_X * 2 - gap * (data.length - 1)) / data.length

  const bars = data.map((v, i) => {
    // Nếu dữ liệu lớn hơn 50 thì giới hạn chiều cao cột
    const chartValue = Math.min(v, max)

    const h = (chartValue / max) * (CHART_H - PAD_TOP - PAD_BOTTOM)

    return {
      x: PAD_X + i * (barW + gap),
      y: CHART_H - PAD_BOTTOM - h,
      w: barW,
      h,
      value: v,
    }
  })

  const yTicks = [50, 40, 30, 20, 10, 0].map((value) => {
    const ratio = value / max

    const y = CHART_H - PAD_BOTTOM - ratio * (CHART_H - PAD_TOP - PAD_BOTTOM)

    return {
      y,
      label: value,
    }
  })

  return {
    bars,
    yTicks,
  }
}

const Dashboard = () => {
  const [mounted, setMounted] = useState(false)
  const [page, setPage] = useState(1)
  // dashboard
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  // revenue data
  const [revenueData, setRevenueData] = useState([])
  const [loadingRevenue, setLoadingRevenue] = useState(true) // thêm dòng này
  const totalPages = 18
  // orders chart
  const [ordersChart, setOrdersChart] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  // orders statistic
  const [orderStatusData, setOrderStatusData] = useState([])
  const [loadingStatus, setLoadingStatus] = useState(true)
  useEffect(() => {
    getDashboard()
    getRevenueChart()
    getOrdersChart()
    getOrderStatusChart()
  }, [])

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const getDashboard = async () => {
    try {
      setLoading(true)

      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/admin/dashboard`,
      )

      if (response.data.success) {
        setDashboardData(response.data.data)
      }
    } catch (error) {
      console.error("Lỗi lấy dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRevenueChart = async () => {
    try {
      setLoadingRevenue(true)

      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/admin/revenue-chart`,
      )

      if (response.data.success) {
        setRevenueData(response.data.data || [])
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu doanh thu:", error)
    } finally {
      setLoadingRevenue(false)
    }
  }
  const getOrdersChart = async () => {
    try {
      setLoadingOrders(true)

      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/admin/orders-chart`,
      )

      if (response.data.success) {
        setOrdersChart(response.data.data)
      }
    } catch (error) {
      console.error("Lỗi lấy biểu đồ đơn hàng:", error)
    } finally {
      setLoadingOrders(false)
    }
  }
  const getOrderStatusChart = async () => {
    try {
      setLoadingStatus(true)

      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/admin/order-statistic`, // đổi đúng URL API của bạn
      )

      if (response.data.success) {
        setOrderStatusData(response.data.data || [])
      }
    } catch (error) {
      console.error("Lỗi lấy thống kê trạng thái đơn hàng:", error)
    } finally {
      setLoadingStatus(false)
    }
  }
  // Nhãn ngày dùng chung cho cả 2 biểu đồ, tính từ revenueData
  const DATES = useMemo(() => {
    return revenueData.map((item) => {
      const date = new Date(item.date)
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      })
    })
  }, [revenueData])
  const ORDER_DATES = useMemo(() => {
    return ordersChart.map((item) => {
      const date = new Date(item.date)

      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      })
    })
  }, [ordersChart])
  const REVENUE_DATA = useMemo(() => {
    return revenueData.map((item) => item.revenue)
  }, [revenueData])

  const STATS = dashboardData
    ? [
        {
          label: "Tổng doanh thu",
          value: `${dashboardData.totalRevenue.toLocaleString("vi-VN")}đ`,
          change: dashboardData.changes.revenue,
          icon: "fa-solid fa-sack-dollar",
          tone: "blue",
        },
        {
          label: "Tổng đơn hàng",
          value: dashboardData.totalOrders.toLocaleString("vi-VN"),
          change: dashboardData.changes.orders,
          icon: "fa-solid fa-cart-shopping",
          tone: "green",
        },
        {
          label: "Tổng khách hàng",
          value: dashboardData.totalCustomers.toLocaleString("vi-VN"),
          change: dashboardData.changes.customers,
          icon: "fa-solid fa-user-group",
          tone: "orange",
        },
        {
          label: "Tổng sản phẩm",
          value: dashboardData.totalProducts.toLocaleString("vi-VN"),
          change: dashboardData.changes.products,
          icon: "fa-solid fa-box",
          tone: "purple",
        },
        {
          label: "Đánh giá mới",
          value: dashboardData.newReviews.toLocaleString("vi-VN"),
          change: dashboardData.changes.reviews,
          icon: "fa-solid fa-comment-dots",
          tone: "teal",
        },
      ]
    : []

  // Thêm REVENUE_DATA vào dependency: trước đây để [] nên chart không
  // bao giờ cập nhật lại sau khi API trả dữ liệu về
  const revenue = useMemo(() => buildLine(REVENUE_DATA), [REVENUE_DATA])
  const ordersChartData = useMemo(() => {
    return buildBars(ordersChart.map((item) => item.orders))
  }, [ordersChart])

  const bars = ordersChartData.bars
  const orderYTicks = ordersChartData.yTicks

  const donutStyle = useMemo(() => {
    if (orderStatusData.length === 0) return {}

    let cursor = 0
    const stops = orderStatusData.map((s) => {
      const start = (cursor / 100) * 360
      cursor += s.percent
      const end = (cursor / 100) * 360
      return `${s.color} ${start}deg ${end}deg`
    })
    return { background: `conic-gradient(${stops.join(", ")})` }
  }, [orderStatusData]) // thêm dependency, trước đây [] khiến donut không tự cập nhật

  return (
    <div className={`dashboard ${mounted ? "is-mounted" : ""}`}>
      {/* ===== HEADER ===== */}
      <div className="dashboard-top">
        <div>
          <h1>Dashboard</h1>
          <p className="breadcrumb">
            Trang chủ <i className="fa-solid fa-chevron-right"></i> Dashboard
          </p>
        </div>
        <button className="date-range-btn">
          <i className="fa-regular fa-calendar"></i>
          01/05/2025 - 09/05/2025
        </button>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="stat-cards">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                className="stat-card skeleton"
                key={i}
              >
                <div className="stat-icon skeleton-block"></div>
                <div className="stat-body">
                  <span className="skeleton-line w-60"></span>
                  <span className="skeleton-line w-80 h-lg"></span>
                  <span className="skeleton-line w-40"></span>
                </div>
              </div>
            ))
          : STATS.map((s, i) => (
              <div
                className="stat-card"
                key={s.label}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className={`stat-icon tone-${s.tone}`}>
                  <i className={s.icon}></i>
                </div>
                <div className="stat-body">
                  <span className="stat-label">{s.label}</span>
                  <span className="stat-value">{s.value}</span>
                  <span
                    className={`stat-change ${s.change >= 0 ? "up" : "down"}`}
                  >
                    <i
                      className={
                        s.change >= 0
                          ? "fa-solid fa-caret-up"
                          : "fa-solid fa-caret-down"
                      }
                    ></i>
                    {s.change > 0 ? "+" : ""}
                    {s.change}% so với tuần trước
                  </span>
                </div>
              </div>
            ))}
      </div>

      {/* ===== CHARTS ===== */}
      <div className="dashboard-grid">
        <div className="card chart-card area-revenue">
          <div className="card-head">
            <h3>Doanh thu</h3>
            <button className="select-btn">
              7 ngày qua <i className="fa-solid fa-chevron-down"></i>
            </button>
          </div>

          {loadingRevenue ? (
            <div className="chart-loading">
              <div className="spinner"></div>
              <p>Đang tải dữ liệu doanh thu...</p>
            </div>
          ) : revenue.points.length > 0 ? (
            <svg
              viewBox={`0 0 ${CHART_W} ${CHART_H}`}
              className="line-chart"
            >
              <defs>
                <linearGradient
                  id="revenueFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#2f6fed"
                    stopOpacity="0.28"
                  />
                  <stop
                    offset="100%"
                    stopColor="#2f6fed"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              {/* Lưới ngang + nhãn giá trị trục Y, giúp đọc số liệu chính xác hơn thay vì chỉ nhìn hình dạng đường */}
              {revenue.yTicks.map((tick, i) => (
                <g key={i}>
                  <line
                    x1={PAD_X}
                    x2={CHART_W - PAD_X}
                    y1={tick.y}
                    y2={tick.y}
                    className="grid-line"
                  />
                  <text
                    x={PAD_X - 8}
                    y={tick.y}
                    className="axis-y-label"
                    textAnchor="end"
                    dominantBaseline="middle"
                  >
                    {tick.label}
                  </text>
                </g>
              ))}

              <path
                d={revenue.areaPath}
                className="area-path"
              />
              <path
                d={revenue.linePath}
                className="line-path"
              />

              {revenue.points.map(([x, y], i) => (
                <g
                  key={i}
                  className="point-group"
                >
                  {/* vùng hover rộng hơn để dễ trỏ chuột, vòng tròn hiển thị nhỏ hơn */}
                  <circle
                    cx={x}
                    cy={y}
                    r={10}
                    className="line-dot-hit"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={i === revenue.points.length - 1 ? 5 : 3.5}
                    className="line-dot"
                  />
                  <title>
                    {DATES[i]}: {REVENUE_DATA[i]?.toLocaleString("vi-VN")}đ
                  </title>
                </g>
              ))}

              {DATES.map((d, i) => (
                <text
                  key={`${d}-${i}`}
                  x={revenue.points[i][0]}
                  y={CHART_H - 8}
                  className="axis-label"
                  textAnchor="middle"
                >
                  {d}
                </text>
              ))}
            </svg>
          ) : (
            <p className="chart-empty">Chưa có dữ liệu doanh thu</p>
          )}
        </div>

        <div className="card chart-card area-orders">
          <div className="card-head">
            <h3>Đơn hàng</h3>
            <button className="select-btn">
              7 ngày qua <i className="fa-solid fa-chevron-down"></i>
            </button>
          </div>

          {loadingOrders ? (
            <div className="chart-loading">
              <div className="spinner"></div>
              <p>Đang tải dữ liệu đơn hàng...</p>
            </div>
          ) : bars.length > 0 ? (
            <svg
              viewBox={`0 0 ${CHART_W} ${CHART_H}`}
              className="bar-chart"
            >
              {orderYTicks.map((tick, i) => (
                <g key={i}>
                  <line
                    x1={PAD_X}
                    x2={CHART_W - PAD_X}
                    y1={tick.y}
                    y2={tick.y}
                    className="grid-line"
                  />
                  <text
                    x={PAD_X - 8}
                    y={tick.y}
                    className="axis-y-label"
                    textAnchor="end"
                    dominantBaseline="middle"
                  >
                    {tick.label}
                  </text>
                </g>
              ))}

              {bars.map((b, i) => (
                <g key={i}>
                  <rect
                    x={b.x}
                    width={b.w}
                    y={b.y}
                    height={b.h}
                    rx="4"
                    className="bar-rect"
                    style={{ transitionDelay: `${i * 40}ms` }}
                  />
                  {/* số lượng đơn ngay trên đỉnh cột, đọc nhanh không cần hover */}
                  <text
                    x={b.x + b.w / 2}
                    y={b.y - 6}
                    className="bar-value-label"
                    textAnchor="middle"
                  >
                    {b.value}
                  </text>
                </g>
              ))}

              {ORDER_DATES.map((d, i) =>
                bars[i] ? (
                  <text
                    key={`${d}-${i}`}
                    x={bars[i].x + bars[i].w / 2}
                    y={CHART_H - 8}
                    className="axis-label"
                    textAnchor="middle"
                  >
                    {d}
                  </text>
                ) : null,
              )}
            </svg>
          ) : (
            <p className="chart-empty">Chưa có dữ liệu đơn hàng</p>
          )}
        </div>

        <div className="card chart-card area-status">
          <div className="card-head">
            <h3>Đơn hàng theo trạng thái</h3>
          </div>

          {loadingStatus ? (
            <div className="chart-loading">
              <div className="spinner"></div>
              <p>Đang tải dữ liệu trạng thái...</p>
            </div>
          ) : orderStatusData.length > 0 ? (
            <div className="donut-wrap">
              <div
                className="donut"
                style={donutStyle}
              >
                <div className="donut-hole"></div>
              </div>
              <ul className="donut-legend">
                {orderStatusData.map((s) => (
                  <li key={s.status}>
                    <span
                      className="dot"
                      style={{ background: s.color }}
                    ></span>
                    {s.label} <b>{s.value}</b>{" "}
                    <span className="muted">({s.percent}%)</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="chart-empty">Chưa có đơn hàng nào</p>
          )}
        </div>

        <LatestProduct></LatestProduct>

        {/* ===== SIDE WIDGETS ===== */}
        <div className="card area-side">
          <TopProducts></TopProducts>
          <div className="card-head activity-head">
            <h3>Hoạt động gần đây</h3>
          </div>
          <ul className="activity-list">
            {ACTIVITIES.map((a, i) => (
              <li key={i}>
                <span className={`activity-icon tone-${a.tone}`}>
                  <i className={a.icon}></i>
                </span>
                <div>
                  <p>{a.text}</p>
                  <span className="time">{a.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
