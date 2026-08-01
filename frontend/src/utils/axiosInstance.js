import axios from "axios"

// nơi để xử lí request có bearer và gửi request trước khi
// hết accessToken

const axiosInstance = axios.create()

// gửi request thay vì dùng thêm bearer

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// interceptors chạy trước khi request gửi đi
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem("refreshToken")
      if (!refreshToken) {
        localStorage.clear()
        window.location.href = "/login"
        return Promise.reject(error)
      }
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_APP_URL}/auth/refresh-token`,
          { refreshToken },
        )

        const newAccessToken = res.data.accessToken
        const newRefreshToken = res.data.refreshToken
        localStorage.setItem("accessToken", newAccessToken)
        localStorage.setItem("refreshToken", newRefreshToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        return axiosInstance(originalRequest)
      } catch (err) {
        localStorage.clear()
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
