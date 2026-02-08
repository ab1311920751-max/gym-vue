<template>
  <div>
    <div style="margin-bottom: 20px;">
      <h2 style="margin: 0;">📅 热门课程表 (抢课版)</h2>
      <p style="color: #666;">VIP会员享受折扣 | 防止超卖保护中</p>
    </div>

    <el-card>
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column prop="name" label="课程名称" width="180">
            <template #default="scope">
                <el-tag effect="dark">{{ scope.row.name }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="coach" label="教练" width="120" />
        <el-table-column prop="startTime" label="时间" width="180" />
        
        <el-table-column label="价格" width="100">
           <template #default="scope">
             <span style="color: #f56c6c; font-weight: bold">￥{{ scope.row.price }}</span>
           </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100">
           <template #default="scope">
             <span :style="{color: scope.row.stock < 3 ? 'red' : 'green'}">
               {{ scope.row.stock }} 剩余
             </span>
           </template>
        </el-table-column>

        <el-table-column label="操作" align="center">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
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
    tableData.value = res.data
  } catch (e) { console.error(e) }
}

const handleBook = async (row) => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return ElMessage.error('请先登录')
  const user = JSON.parse(userStr)

  try {
    // 调用新的后端接口
    const res = await request.post('/booking/create', {
      userId: user.id,
      courseId: row.id
    })
    
    // 后端返回的是 Result.success(bookingId)
    // 简单模拟支付流程
    if (res.code === '200') {
      ElMessageBox.confirm(
        `抢课成功！订单ID: ${res.data}，请前往支付。`,
        '系统提示',
        { confirmButtonText: '去查看订单', cancelButtonText: '稍后支付', type: 'success' }
      ).then(() => {
        router.push('/my-booking')
      })
      loadCourses() // 刷新库存显示
    } else {
      ElMessage.error(res.msg || '预约失败')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error(e.msg || '系统繁忙')
  }
}

onMounted(() => loadCourses())
</script>