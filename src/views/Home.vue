<template>
  <div class="dashboard-container">
    <div style="margin-bottom: 20px">
      <h2 style="margin: 0">📊 运营数据驾驶舱</h2>
      <p style="color: #909399; font-size: 14px; margin-top: 5px">
        实时监控系统核心指标，数据每分钟自动刷新
      </p>
    </div>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-icon" style="background: #fef0f0; color: #f56c6c">💰</div>
          <div class="card-content">
            <div class="card-title">总营收</div>
            <div class="card-num">￥{{ report.totalRevenue || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-icon" style="background: #ecf5ff; color: #409eff">👥</div>
          <div class="card-content">
            <div class="card-title">总用户数</div>
            <div class="card-num">{{ report.userCount || 0 }} 人</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-icon" style="background: #f0f9eb; color: #67c23a">📝</div>
          <div class="card-content">
            <div class="card-title">订单总量</div>
            <div class="card-num">{{ report.orderCount || 0 }} 单</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-icon" style="background: #fdf6ec; color: #e6a23c">🤖</div>
          <div class="card-content">
            <div class="card-title">AI 咨询热度</div>
            <div class="card-num">999+</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 30px">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="chart-header">
              <span>📈 近七日营收趋势 (模拟)</span>
            </div>
          </template>
          <div id="lineChart" style="height: 350px; width: 100%"></div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <div class="chart-header">
              <span>👑 会员等级分布</span>
            </div>
          </template>
          <div id="pieChart" style="height: 350px; width: 100%"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import request from '../utils/request'
import * as echarts from 'echarts'

const report = ref({})

// 加载数据
const loadData = async () => {
  try {
    const res = await request.get('/report/dashboard')
    if (res.code === '200') {
      report.value = res.data
      // 确保 DOM 渲染完后再画图
      nextTick(() => {
        initCharts(res.data)
      })
    }
  } catch (e) { console.error(e) }
}

// 初始化图表
const initCharts = (data) => {
  // --- 1. 饼图 (真实数据) ---
  const pieDom = document.getElementById('pieChart')
  if (pieDom) {
    const pieChart = echarts.init(pieDom)
    pieChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '0%' },
      series: [
        {
          name: '会员分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: { show: false, position: 'center' },
          emphasis: {
            label: { show: true, fontSize: 20, fontWeight: 'bold' }
          },
          data: data.vipData || []
        }
      ]
    })
  }

  // --- 2. 折线图 (模拟数据，用于展示趋势) ---
  const lineDom = document.getElementById('lineChart')
  if (lineDom) {
    const lineChart = echarts.init(lineDom)
    lineChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '营收',
          type: 'line',
          smooth: true,
          stack: 'Total',
          areaStyle: {},
          emphasis: { focus: 'series' },
          data: [120, 132, 101, 134, 90, 230, 210], // 模拟数据
          itemStyle: { color: '#409EFF' },
          areaStyle: { color: '#ecf5ff' }
        }
      ]
    })
  }
  
  // 监听窗口缩放，自动调整图表大小
  window.addEventListener('resize', () => {
      echarts.getInstanceByDom(document.getElementById('pieChart'))?.resize()
      echarts.getInstanceByDom(document.getElementById('lineChart'))?.resize()
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard-container {
  padding: 10px;
}
.data-card {
  display: flex;
  align-items: center;
  border: none;
  border-radius: 8px;
}
/* Flex 布局修复卡片内容对齐 */
.data-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 20px !important;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  margin-right: 20px;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.card-num {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.chart-header {
  font-weight: bold;
  color: #303133;
}
</style>