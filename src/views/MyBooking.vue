<template>
  <div>
    <h2>📝 我的预约记录</h2>
    
    <el-card style="margin-top: 20px;">
      <el-table :data="tableData" stripe>
        <el-table-column prop="courseName" label="课程名称">
          <template #default="scope">
            <strong>{{ scope.row.courseName }}</strong>
          </template>
        </el-table-column>
        
        <el-table-column prop="coach" label="教练" width="120" />
        
        <el-table-column prop="startTime" label="上课时间" width="200">
           <template #default="scope">
             <span style="color: #409EFF">{{ formatTime(scope.row.startTime) }}</span>
           </template>
        </el-table-column>
        
        <el-table-column prop="bookingTime" label="预约时间" width="200">
           <template #default="scope">
             <span style="color: #909399">{{ formatTime(scope.row.bookingTime) }}</span>
           </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default>
            <el-tag type="success">已预约</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-popconfirm title="确定要取消这个预约吗？" @confirm="handleCancel(scope.row.id)">
              <template #reference>
                <el-button type="danger" size="small">取消</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'
import { ElMessage } from 'element-plus'

const tableData = ref([])
const user = JSON.parse(localStorage.getItem('user') || '{}')

// 简单的格式化时间函数
const formatTime = (timeStr) => {
  return timeStr ? timeStr.replace('T', ' ') : ''
}

// 加载我的预约
const loadMyBookings = async () => {
  const res = await request.get('/booking/list', {
    params: { userId: user.id }
  })
  tableData.value = res.data
}

// 取消预约
const handleCancel = async (id) => {
  await request.post(`/booking/cancel?id=${id}`)
  ElMessage.success('已取消')
  loadMyBookings() // 刷新列表
}

onMounted(() => {
  loadMyBookings()
})
</script>