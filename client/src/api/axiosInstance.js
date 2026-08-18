import axios from 'axios'

let myAxiosThing = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
  
})

myAxiosThing.interceptors.request.use(
  function(requestObj) {
    let savedTokenVal = sessionStorage.getItem('vpms_token')
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
      sessionStorage.removeItem('vpms_token')
      sessionStorage.removeItem('vpms_user')
      window.location.href = '/login'
    }
    return Promise.reject(badErrorObj)
  }
)

export default myAxiosThing
