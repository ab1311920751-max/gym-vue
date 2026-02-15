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

        <el-table-column label="操作" width="220">
          <template #default="scope">
            <div v-if="scope.row.status === 0">
                <el-button 
                  type="success" 
                  size="small" 
                  @click="handlePay(scope.row.id)">
                  余额支付
                </el-button>
                
                <el-button 
                  type="primary" 
                  plain
                  size="small" 
                  @click="handleAlipay(scope.row.bookingNo)">
                  支付宝
                </el-button>
                
                 <!-- 待支付也可以取消 -->
                 <el-button 
                  type="text" 
                  size="small" 
                  style="color: #909399; margin-left: 5px"
                  @click="handleCancel(scope.row.id)">
                  取消
                </el-button>
            </div>

            <div v-else-if="scope.row.status === 1">
                <el-button 
                  type="danger" 
                  plain
                  size="small" 
                  @click="handleCancel(scope.row.id)">
                  取消预约
                </el-button>
            </div>
            
             <span v-else style="color: #ccc; font-size: 12px">不可操作</span>
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
    // 后端接口：/booking/my?userId=xxx
    const res = await request.get('/booking/my', {
        params: { userId: user.id }
    })
    if (res.code === '200') {
        tableData.value = res.data
    }
  } catch(e) { console.error(e) }
}

// 余额支付
const handlePay = async (id) => {
    try {
        const res = await request.post(`/booking/pay/${id}`)
        if (res.code === '200') {
            ElMessage.success('余额支付成功！')
            load()
            window.dispatchEvent(new Event('refresh-user'))
        }
    } catch(e) { console.error(e) }
}

// 支付宝支付
const handleAlipay = (bookingNo) => {
    window.location.href = `http://localhost:8080/alipay/pay?bookingNo=${bookingNo}`
}

// 取消预约 (兼容 待支付取消 和 已预约退款)
const handleCancel = (id) => {
    ElMessageBox.confirm('确定要取消/退订吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '再想想',
        type: 'warning'
    }).then(async () => {
        try {
            const res = await request.post(`/booking/cancel/${id}`)
            if (res.code === '200') {
                ElMessage.success('操作成功')
                load()
                window.dispatchEvent(new Event('refresh-user'))
            }
        } catch(e) { console.error(e) }
    })
}

onMounted(() => load())
</script>