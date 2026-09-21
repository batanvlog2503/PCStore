import axios from "axios"

const axiosInstance = axios.create()

// =========================
// REQUEST INTERCEPTOR
// =========================

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// =========================
// RESPONSE INTERCEPTOR
// =========================

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    const status = error.response?.status

    // AccessToken hết hạn
    if ((status === 401 || status === 403) && !originalRequest?._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem("refreshToken")

      // Không còn refreshToken
      if (!refreshToken) {
        localStorage.clear()
        window.location.href = "/403"

        return Promise.reject(error)
      }

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_APP_URL}/auth/refresh-token`,
          {
            refreshToken,
          },
        )

        const newAccessToken = res.data.accessToken
        const newRefreshToken = res.data.refreshToken

        localStorage.setItem("accessToken", newAccessToken)

        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken)
        }

        // Gắn accessToken mới vào request cũ
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        // Gửi lại request cũ
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // RefreshToken cũng hết hạn / không hợp lệ
        localStorage.clear()

        window.location.href = "/403"

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
