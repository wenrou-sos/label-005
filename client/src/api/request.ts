import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'ant-design-vue'
import type { ApiResponse } from '@/types'

const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data as ApiResponse<unknown>
    if (res.success) {
      return response
    }
    message.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || 'Request failed'))
  },
  (error) => {
    const errMsg = error.response?.data?.message || error.message || '网络错误'
    message.error(errMsg)
    return Promise.reject(error)
  }
)

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await service.request<ApiResponse<T>>(config)
  return response.data.data
}

export default service
