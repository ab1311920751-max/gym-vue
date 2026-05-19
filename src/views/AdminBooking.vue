<template>
  <div class="admin-booking-page">
    <div class="page-header">
      <h2 class="page-title"><el-icon><List /></el-icon><span>订单管理</span></h2>
    </div>

    <el-card shadow="never" class="content-card">
      <el-table v-loading="loading" :data="list" stripe empty-text="暂无订单">
        <el-table-column prop="id" label="订单 ID" width="100" />
        <el-table-column prop="courseName" label="课程" min-width="160" />
        <el-table-column prop="coach" label="教练" width="120" />
        <el-table-column label="用户" width="120">
          <template #default="{ row }">{{ row.username || '—' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag[row.status]" effect="light">{{ statusLabel[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="100">
          <template #default="{ row }"><span class="price">￥{{ row.price }}</span></template>
        </el-table-column>
        <el-table-column label="预约时间" width="170">
          <template #default="{ row }">{{ formatTime(row.bookingTime) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { List } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { listAdminBookings } from '../api/booking'
import { BOOKING_STATUS, BOOKING_STATUS_LABEL, BOOKING_STATUS_TAG_TYPE } from '../constants/booking'

const list = ref([])
const loading = ref(true)
const statusLabel = BOOKING_STATUS_LABEL
const statusTag = BOOKING_STATUS_TAG_TYPE

const load = async () => {
  loading.value = true
  try {
    const res = await listAdminBookings()
    list.value = res.data || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const formatTime = (v) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '—'

onMounted(() => load())
</script>

<style scoped>
.admin-booking-page { padding: 4px; }
.page-header { margin-bottom: 16px; }
.page-title { margin: 0; font-size: 22px; font-weight: 700; color: #1f2d3d; display: flex; align-items: center; gap: 8px; }
.content-card { border: none; border-radius: 10px; }
.price { color: #ff7a2f; font-weight: 700; }
</style>
