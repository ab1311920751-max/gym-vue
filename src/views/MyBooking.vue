<template>
  <div>
    <h2 style="margin-bottom: 20px">📝 我的课程订单</h2>

    <el-card>
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column prop="bookingNo" label="订单号" width="180">
            <template #default="scope">
                <span style="font-size: 12px; color: #999">{{ scope.row.bookingNo }}</span>
            </template>
        </el-table-column>

        <el-table-column prop="courseName" label="课程名称" min-width="150">
            <template #default="scope">
                <span style="font-weight: bold">{{ scope.row.courseName }}</span>
            </template>
        </el-table-column>

        <el-table-column prop="coach" label="教练" width="120" />

        <el-table-column prop="startTime" label="上课时间" width="180">
            <template #default="scope">
                <i class="el-icon-time"></i> {{ scope.row.startTime }}
            </template>
        </el-table-column>

        <el-table-column prop="price" label="实付金额" width="100">
            <template #default="scope">
                ￥{{ scope.row.price }}
            </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="warning">待支付</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="success">已预约</el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="info">已取消</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 0" 
              type="danger" 
              size="small" 
              @click="handlePay(scope.row.id)">
              立即支付
            </el-button>
            
            <el-button 
              v-if="scope.row.status === 1" 
              type="info" 
              size="small" 
              @click="handleCancel(scope.row.id)">
              取消
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

const tableData = ref([])

const load = async () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return
  const user = JSON.parse(userStr)

  try {
    // 调用刚才写的后端接口 /booking/my
    const res = await request.get('/booking/my', {
        params: { userId: user.id }
    })
    if (res.code === '200') {
        tableData.value = res.data
    }
  } catch(e) { console.error(e) }
}

const handlePay = async (id) => {
    try {
        await request.post(`/booking/pay/${id}`)
        ElMessage.success('支付成功！')
        load() // 刷新列表
    } catch(e) { console.error(e) }
}

const handleCancel = (id) => {
    ElMessageBox.confirm('确定要取消这节课吗？退款将原路返回。', '提示', {
        confirmButtonText: '确定取消',
        cancelButtonText: '再想想',
        type: 'warning'
    }).then(async () => {
        try {
            await request.post(`/booking/cancel/${id}`)
            ElMessage.success('已取消预约')
            load()
        } catch(e) { console.error(e) }
    })
}

onMounted(() => load())
</script>