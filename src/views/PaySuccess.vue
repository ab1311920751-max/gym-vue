<template>
  <div class="pay-success-container">
    <el-card class="box-card">
      <div class="content">
        <el-icon v-if="loading" class="is-loading" :size="50" color="#409EFF"><Loading /></el-icon>
        <el-icon v-else-if="success" :size="50" color="#67C23A"><CircleCheckFilled /></el-icon>
        <el-icon v-else :size="50" color="#F56C6C"><CircleCloseFilled /></el-icon>
        
        <h2 style="margin-top: 20px">{{ msg }}</h2>
        <p v-if="success" style="color: #909399">订单号: {{ bookingNo }}</p>
        
        <div style="margin-top: 30px">
          <el-button type="primary" @click="goHome">返回首页</el-button>
          <el-button @click="goOrders">查看订单</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request'
import { CircleCheckFilled, CircleCloseFilled, Loading } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const success = ref(false)
const msg = ref('正在确认支付结果...')
const bookingNo = ref('')

onMounted(() => {
  // 1. 获取支付宝回调参数 (out_trade_no, trade_no 等)
  const params = route.query
  bookingNo.value = params.out_trade_no
  
  if (!bookingNo.value) {
    loading.value = false
    msg.value = '参数异常，无法确认订单'
    return
  }

  // 2. 调用后端接口同步状态
  // 注意：这里调用的是我们上一轮写的 Backend API
  request.get('/alipay/return', { params: params })
    .then(res => {
      loading.value = false
      if (res.code === '200') {
        success.value = true
        msg.value = '支付成功！'
      } else {
        success.value = false
        msg.value = '支付确认失败：' + res.msg
      }
    })
    .catch(err => {
      loading.value = false
      success.value = false
      msg.value = '网络请求失败'
      console.error(err)
    })
})

const goHome = () => router.push('/')
const goOrders = () => router.push('/my-booking')
</script>

<style scoped>
.pay-success-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
}
.box-card {
  width: 500px;
  text-align: center;
  padding: 40px;
}
</style>