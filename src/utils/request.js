import axios from 'axios'
import { ElMessage } from 'element-plus'

// 1. 创建 axios 实例
const request = axios.create({
    baseURL: 'http://localhost:8080', 
    timeout: 5000
})

// 2. 请求拦截器
request.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers['Authorization'] = token
    }
    return config
}, error => {
    return Promise.reject(error)
})

// 3. 响应拦截器
request.interceptors.response.use(
    response => {
        const res = response.data
        
        // 🐛 修复点：使用 != (弱比较) 兼容字符串 "200" 和数字 200
        if (res.code != 200) {
            ElMessage.error(res.msg || '系统错误')
            return Promise.reject(new Error(res.msg || 'Error'))
        }
        return res
    },
    error => {
        // 如果是 401 说明 Token 过期或未登录
        if (error.response && error.response.status === 401) {
            ElMessage.error('登录过期，请重新登录')
            localStorage.removeItem('user')
            localStorage.removeItem('token')
            // 这里可以加跳转逻辑，比如 window.location.href = '/login'
        } else {
            ElMessage.error(error.message || '网络异常')
        }
        return Promise.reject(error)
    }
)

export default request