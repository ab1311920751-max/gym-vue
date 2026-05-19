<template>
  <div class="dashboard-container">
    <div class="page-header">
      <h2 class="page-title">运营数据驾驶舱</h2>
      <p class="page-subtitle">实时监控系统核心指标</p>
    </div>

    <el-row :gutter="20" v-loading="loading">
      <el-col :xs="24" :sm="12" :md="6" v-for="(item, idx) in kpiList" :key="idx">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-strip" :style="{ background: item.color }"></div>
          <div class="kpi-body">
            <div class="kpi-icon" :style="{ color: item.color }">
              <el-icon :size="26"><component :is="item.icon" /></el-icon>
            </div>
            <div class="kpi-content">
              <div class="kpi-title">{{ item.title }}</div>
              <div class="kpi-num">{{ item.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="chart-header">
              <el-icon><DataAnalysis /></el-icon>
              <span>业务概览</span>
            </div>
          </template>
          <div class="summary-grid">
            <div class="summary-row" v-for="row in summaryRows" :key="row.label">
              <span class="summary-label">{{ row.label }}</span>
              <span class="summary-value">{{ row.value }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, markRaw } from 'vue'
import { Money, User, Tickets, Medal, DataAnalysis } from '@element-plus/icons-vue'
import { getDashboard } from '../api/report'

const report = ref({})
const loading = ref(true)

const kpiList = computed(() => [
  { title: '总营收',   value: `￥${Number(report.value.totalRevenue || 0).toLocaleString()}`, icon: markRaw(Money),   color: '#ff7a2f' },
  { title: '总用户数', value: `${report.value.userCount || 0} 人`,                            icon: markRaw(User),    color: '#409eff' },
  { title: '订单总量', value: `${report.value.bookingCount || 0} 单`,                          icon: markRaw(Tickets), color: '#67c23a' },
  { title: '课程总数', value: `${report.value.courseCount || 0} 节`,                            icon: markRaw(Medal),   color: '#e6a23c' }
])

const summaryRows = computed(() => {
  const aov = report.value.bookingCount > 0
    ? (Number(report.value.totalRevenue || 0) / report.value.bookingCount).toFixed(2)
    : '0.00'
  return [
    { label: '课程总数', value: `${report.value.courseCount || 0} 节` },
    { label: '客单价',   value: `￥${aov}` },
    { label: '累计订单', value: `${report.value.bookingCount || 0} 单` },
    { label: '累计营收', value: `￥${Number(report.value.totalRevenue || 0).toLocaleString()}` }
  ]
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getDashboard()
    report.value = res.data || {}
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => { loadData() })
</script>

<style scoped>
.dashboard-container {
  padding: 4px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #1f2d3d;
}

.page-subtitle {
  color: #909399;
  font-size: 13px;
  margin-top: 6px;
}

.kpi-card {
  border: none;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 16px;
  position: relative;
}

.kpi-card :deep(.el-card__body) {
  padding: 0 !important;
}

.kpi-strip {
  height: 4px;
  width: 100%;
}

.kpi-body {
  display: flex;
  align-items: center;
  padding: 22px 24px;
}

.kpi-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: #fff5ee;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.kpi-content {
  flex: 1;
  min-width: 0;
}

.kpi-title {
  font-size: 13px;
  color: #909399;
  margin-bottom: 6px;
}

.kpi-num {
  font-size: 24px;
  font-weight: 700;
  color: #1f2d3d;
  line-height: 1.2;
}

.chart-row {
  margin-top: 8px;
}

.chart-card {
  border: none;
  border-radius: 10px;
  margin-bottom: 16px;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1f2d3d;
  font-size: 15px;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px dashed #f0f0f0;
}

.summary-label {
  color: #606266;
  font-size: 14px;
}

.summary-value {
  color: #ff7a2f;
  font-size: 18px;
  font-weight: 700;
}
</style>
