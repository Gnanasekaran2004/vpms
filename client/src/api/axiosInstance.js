import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
})

axiosInstance.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem('vpms_token')
    if (token) req.headers.Authorization = `Bearer ${token}`
    return req
  },
  (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vpms_token')
      localStorage.removeItem('vpms_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
