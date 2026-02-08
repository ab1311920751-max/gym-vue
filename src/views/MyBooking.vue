<template>
  <div class="booking-container">
    <div style="margin-bottom: 20px;">
      <h2 style="margin: 0;">📝 我的预约订单</h2>
      <p style="color: #666;">请在 15 分钟内完成支付，否则订单将自动取消</p>
    </div>

    <el-card>
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="bookingNo" label="订单编号" width="190">
            <template #default="scope">
                <span style="font-family: monospace; color: #409EFF">{{ scope.row.bookingNo }}</span>
            </template>
        </el-table-column>

        <el-table-column prop="courseName" label="课程名称" min-width="150" />
        
        <el-table-column label="教练" width="120">
             <template #default="scope">
                <el-tag size="small" type="info">{{ scope.row.coach || '金牌教练' }}</el-tag>
             </template>
        </el-table-column>

        <el-table-column prop="bookingTime" label="下单时间" width="170" />

        <el-table-column label="实付金额" width="120">
          <template #default="scope">
             <span style="color: #f56c6c; font-weight: bold; font-size: 15px;">
                ￥{{ scope.row.price }}
             </span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="warning" effect="dark">待支付</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="success" effect="dark">已预约</el-tag>
            <el-tag v-else type="info" effect="plain">已取消</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <div v-if="scope.row.status === 0">
                <el-button 
                  type="success" 
                  size="small" 
                  @click="handlePay(scope.row)"
                  :loading="scope.row.loading">
                  立即支付
                </el-button>
                
                <el-popconfirm 
                  title="确定取消该订单吗？" 
                  confirm-button-text="狠心取消"
                  cancel-button-text="我再想想"
                  @confirm="handleCancel(scope.row)">
                  <template #reference>
                    <el-button type="danger" size="small" plain>取消</el-button>
                  </template>
                </el-popconfirm>
            </div>

            <div v-else>
                <el-button type="info" size="small" disabled>查看详情</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])
const loading = ref(false)
const user = JSON.parse(localStorage.getItem('user') || '{}')

// 加载订单列表
const loadMyBookings = async () => {
  loading.value = true
  try {
      // 对应后端的 @GetMapping("/booking/list")
      const res = await request.get('/booking/list', { params: { userId: user.id } })
      if (res.code === '200') {
          tableData.value = res.data
      } else {
          ElMessage.error(res.msg)
      }
  } catch(e) {
      console.error(e)
  } finally {
      loading.value = false
  }
}

// 模拟支付
const handlePay = async (row) => {
    // 模拟 loading 效果
    row.loading = true
    try {
        // 调用我们刚刚加的后端接口 @PostMapping("/booking/pay")
        const res = await request.post(`/booking/pay?id=${row.id}`)
        
        if (res.code === '200') {
            ElMessage.success('支付成功！(模拟)')
            loadMyBookings() // 刷新状态
        } else {
            ElMessage.error(res.msg || '支付失败')
        }
    } catch(e) {
        ElMessage.error('支付系统异常')
    } finally {
        row.loading = false
    }
}

// 取消订单
const handleCancel = async (row) => {
  try {
      const res = await request.post(`/booking/cancel?id=${row.id}`)
      if (res.code === '200') {
          ElMessage.success('订单已取消')
          loadMyBookings()
      } else {
          ElMessage.error(res.msg)
      }
  } catch(e) {
      ElMessage.error('操作失败')
  }
}

onMounted(() => {
    if(!user.id) {
        ElMessage.warning('请先登录')
    } else {
        loadMyBookings()
    }
})
</script>

<style scoped>
.booking-container {
    padding: 20px;
}
</style>