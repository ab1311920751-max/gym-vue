import axios from 'axios'
import { ElMessage } from 'element-plus'

// 1. 创建 axios 实例
const request = axios.create({
    // 后端接口地址 (一定要和 application.yml 里的端口一致)
    baseURL: 'http://localhost:8080', 
    timeout: 5000
})

// 2. 请求拦截器 (自动带上 Token)
request.interceptors.request.use(config => {
    // 从浏览器缓存获取 token
    const token = localStorage.getItem('token')
    if (token) {
        config.headers['Authorization'] = token
    }
    return config
}, error => {
    return Promise.reject(error)
})

// 3. 响应拦截器 (统一处理结果)
request.interceptors.response.use(
    response => {
        const res = response.data
        // 如果 code 不是 200，说明后端报错了
        if (res.code !== 200) {
            ElMessage.error(res.msg || '系统错误')
            return Promise.reject(new Error(res.msg || 'Error'))
        }
        return res
    },
    error => {
        ElMessage.error(error.message || '网络异常')
        return Promise.reject(error)
    }
)

export default request