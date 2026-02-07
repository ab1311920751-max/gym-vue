<template>
  <div>
    <div style="margin-bottom: 20px;">
      <h2 style="margin: 0;">📅 热门课程表</h2>
      <p style="color: #888; margin: 5px 0;">选择你心仪的课程开始锻炼吧</p>
    </div>

    <el-card>
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column prop="name" label="课程名称" width="180">
            <template #default="scope">
                <el-tag>{{ scope.row.name }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="coach" label="教练" width="120" />
        <el-table-column prop="startTime" label="开课时间" width="200" />
        <el-table-column prop="description" label="课程介绍" />
        <el-table-column prop="capacity" label="剩余名额" width="100" />
        
        <el-table-column label="操作" width="150" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleBook(scope.row)">
              立即预约
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
import { ElMessage } from 'element-plus'

const tableData = ref([])

// 加载课程列表
const loadCourses = async () => {
  try {
    const res = await request.get('/course/list')
    tableData.value = res.data
  } catch (e) {
    console.error(e)
  }
}

// 预约按钮 (先写个架子，下个阶段实现)
const handleBook = async (row) => {
  // 1. 获取当前用户ID
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    ElMessage.error('请先登录')
    return
  }
  const user = JSON.parse(userStr)

  // 2. 发送请求
  try {
    // 构造参数
    const params = {
      userId: user.id,
      courseId: row.id
    }
    
    // 调用刚才写的接口
    const res = await request.post('/booking/add', params)
    
    // 3. 成功提示
    ElMessage.success(res.msg) // 显示后端返回的 "预约成功"
    
  } catch (e) {
    // request.js 会自动弹出错误提示(比如"重复预约")，这里不用写
    console.error(e)
  }
}

// 页面加载时触发
onMounted(() => {
  loadCourses()
})
</script>