<template>
  <div class="favorites-page">
    <div class="page-header">
      <h2 class="page-title"><el-icon><Star /></el-icon><span>我的收藏</span></h2>
    </div>

    <el-card shadow="never" class="content-card">
      <el-table v-loading="loading" :data="list" stripe empty-text="暂无收藏">
        <el-table-column prop="courseName" label="课程" min-width="160" />
        <el-table-column prop="coachName" label="教练" width="120" />
        <el-table-column label="上课时间" width="170">
          <template #default="{ row }">{{ formatTime(row.startTime) }}</template>
        </el-table-column>
        <el-table-column label="价格" width="100">
          <template #default="{ row }"><span class="price">￥{{ row.price }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" @click="$router.push(`/course/${row.courseId}`)">详情</el-button>
            <el-button size="small" type="danger" @click="handleRemove(row.courseId)">取消收藏</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { getMyFavorites, removeFavorite } from '../api/favorite'

const list = ref([])
const loading = ref(true)

const load = async () => {
  loading.value = true
  try {
    const res = await getMyFavorites()
    list.value = res.data || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleRemove = async (courseId) => {
  try {
    await removeFavorite(courseId)
    ElMessage.success('已取消收藏')
    load()
  } catch (e) { console.error(e) }
}

const formatTime = (v) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '—'

onMounted(() => load())
</script>

<style scoped>
.favorites-page { padding: 4px; }
.page-header { margin-bottom: 16px; }
.page-title { margin: 0; font-size: 22px; font-weight: 700; color: #1f2d3d; display: flex; align-items: center; gap: 8px; }
.content-card { border: none; border-radius: 10px; }
.price { color: #ff7a2f; font-weight: 700; }
</style>
