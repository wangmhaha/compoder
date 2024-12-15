import axios, { AxiosError } from "axios"

export const getInstance = (config?: {
  baseURL?: string
  notResponseError?: boolean
}) => {
  const instance = axios.create({
    baseURL: "/api",
    headers: {
      "Content-Type": "application/json",
    },
  })

  instance.interceptors.request.use(
    async request => {
      return request
    },
    err => {
      return Promise.reject(err)
    },
  )

  // Add response interceptor
  instance.interceptors.response.use(
    response => {
      return response
    },
    err => {
      if (config?.notResponseError) {
        return Promise.reject(err)
      }
      return responseError(err)
    },
  )

  return instance
}

export default getInstance

/**
 * Response Error Handler
 */
function responseError(err: AxiosError) {
  console.log("error->", "Request Error", err)

  if (!err) {
    return Promise.reject({ message: "Unknown error" })
  }
  if (typeof err === "string") {
    return Promise.reject({ message: err })
  }
  // Handle error response
  if (err?.response?.status === 403) {
    window.location.replace(
      `/login?lastRoute=${encodeURIComponent(
        location.pathname + location.search,
      )}`,
    )
    return Promise.reject({ message: "Token expired, please login again" })
  }
  // Handle 401 status code
  if (err?.response?.status === 401) {
    window.location.replace("/")
    return Promise.reject({ message: "Unauthorized, redirecting..." })
  }
  if (err?.response?.data) {
    return Promise.reject(err?.response?.data)
  }
  return Promise.reject(err)
}
