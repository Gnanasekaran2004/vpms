import axios from 'axios'

let myAxiosThing = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
  
})

myAxiosThing.interceptors.request.use(
  function(requestObj) {
    let savedTokenVal = localStorage.getItem('vpms_token')
    if (savedTokenVal != null) {
      requestObj.headers.Authorization = 'Bearer ' + savedTokenVal
    }
    return requestObj
  },
  function(errObj) {
    return Promise.reject(errObj)
  }
)

myAxiosThing.interceptors.response.use(
  function(goodRes) {
    return goodRes
  },
  function(badErrorObj) {
    let isUnauthorized = badErrorObj.response && badErrorObj.response.status === 401
    if (isUnauthorized) {
      localStorage.removeItem('vpms_token')
      localStorage.removeItem('vpms_user')
      window.location.href = '/login'
    }
    return Promise.reject(badErrorObj)
  }
)

export default myAxiosThing
