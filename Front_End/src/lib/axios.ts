import axios from "axios"

const axiosInstance = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// ── Request Interceptor ──────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor ─────────────────────────────────────────
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return axiosInstance(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await axiosInstance.get("/auth/refresh-token")
      const newToken: string = data.access_token

      localStorage.setItem("access_token", newToken)
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`
      originalRequest.headers.Authorization = `Bearer ${newToken}`

      processQueue(null, newToken)
      return axiosInstance(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      localStorage.removeItem("access_token")
      if (typeof window !== "undefined") window.location.href = "/auth"
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default axiosInstance