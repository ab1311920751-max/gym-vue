<template>
  <div>
    <div style="margin-bottom: 20px;">
      <h2 style="margin: 0;">📅 热门课程表 (抢课版)</h2>
      <p style="color: #666;">VIP会员享受折扣 | 分布式锁防超卖保护中</p>
    </div>

    <el-card>
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column prop="name" label="课程名称" min-width="150">
            <template #default="scope">
                <el-tag effect="dark" size="large">{{ scope.row.name }}</el-tag>
                <div style="font-size: 12px; color: #888; margin-top: 5px">{{ scope.row.content || '暂无简介' }}</div>
            </template>
        </el-table-column>
        
        <el-table-column prop="coach" label="教练" width="120">
             <template #default="scope">
                <el-tag type="info">{{ scope.row.coach || '待定' }}</el-tag>
             </template>
        </el-table-column>

        <el-table-column prop="startTime" label="上课时间" width="180">
            <template #default="scope">
                <i class="el-icon-time"></i> {{ formatTime(scope.row.startTime) }}
            </template>
        </el-table-column>
        
        <el-table-column label="价格" width="120">
           <template #default="scope">
             <span style="color: #f56c6c; font-weight: bold; font-size: 16px;">￥{{ scope.row.price }}</span>
           </template>
        </el-table-column>

        <el-table-column prop="stock" label="剩余名额" width="120">
           <template #default="scope">
             <span :style="{color: scope.row.stock < 3 ? 'red' : 'green', fontWeight: 'bold'}">
               {{ scope.row.stock }} 
             </span>
           </template>
        </el-table-column>

        <el-table-column label="操作" align="center" width="150">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="default" 
              :loading="scope.row.loading"
              :disabled="scope.row.stock <= 0 || isCourseExpired(scope.row.startTime)"
              @click="handleBook(scope.row)">
              {{ getBtnText(scope.row) }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { courseApi, bookingApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

const tableData = ref([])
const router = useRouter()

const loadCourses = async () => {
  try {
    const res = await courseApi.list()
    if (res.code === '200') {
        tableData.value = res.data.map(item => ({
            ...item,
            loading: false
        }))
    }
  } catch (e) { console.error(e) }
}

const handleBook = async (row) => {
  const userStr = localStorage.getItem('user')
  if (!userStr) {
      ElMessage.error('请先登录')
      router.push('/login')
      return
  }
  const user = JSON.parse(userStr)

  row.loading = true

  try {
    const res = await bookingApi.create({
      userId: user.id,
      courseId: row.id
    })
    
    if (res.code === '200') {
      ElMessageBox.confirm(
        `抢课成功！订单号: ${res.data}。请尽快支付，超时将自动取消。`,
        '🎉 恭喜',
        { confirmButtonText: '去支付', cancelButtonText: '稍后', type: 'success' }
      ).then(() => {
        router.push('/my-booking')
      })
      loadCourses()
    }
  } catch (e) {
    console.error("抢课失败", e)
  } finally {
    row.loading = false
  }
}

const formatTime = (val) => {
    if (!val) return '时间待定'
    return dayjs(val).format('YYYY-MM-DD HH:mm')
}

const isCourseExpired = (timeStr) => {
    if (!timeStr) return false
    return dayjs(timeStr).isBefore(dayjs())
}

const getBtnText = (row) => {
    if (row.stock <= 0) return '已售罄'
    if (isCourseExpired(row.startTime)) return '已结束'
    return '立即抢购'
}

onMounted(() => loadCourses())
</script>
