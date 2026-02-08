<template>
  <div>
    <div style="margin-bottom: 20px;">
      <h2 style="margin: 0;">📅 热门课程表 (抢课版)</h2>
      <p style="color: #666;">VIP会员享受折扣 | 防止超卖保护中</p>
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
              :disabled="scope.row.stock <= 0"
              @click="handleBook(scope.row)">
              {{ scope.row.stock > 0 ? '立即抢购' : '已售罄' }}
            </el-button>
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
import { useRouter } from 'vue-router'

const tableData = ref([])
const router = useRouter()

const loadCourses = async () => {
  try {
    const res = await request.get('/course/list')
    if (res.code === '200') {
        tableData.value = res.data
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

  try {
    // 调用预约接口
    const res = await request.post('/booking/create', {
      userId: user.id,
      courseId: row.id
    })
    
    // 如果 code == 200，说明抢锁成功 + 扣库存成功 + 订单生成成功
    if (res.code === '200') {
      ElMessageBox.confirm(
        `抢课成功！订单ID: ${res.data}，请尽快支付。`,
        '恭喜',
        { confirmButtonText: '去支付', cancelButtonText: '稍后', type: 'success' }
      ).then(() => {
        router.push('/my-booking')
      })
      loadCourses() // 刷新列表，看到库存减少
    } else {
      ElMessage.error(res.msg || '预约失败')
    }
  } catch (e) {
    // 这里的 error 可能是 Axios 的 reject，也可能是后端的报错
    console.error(e) 
  }
}

const formatTime = (val) => {
    if (!val) return '时间待定'
    return val.replace('T', ' ').substring(0, 16)
}

onMounted(() => loadCourses())
</script>