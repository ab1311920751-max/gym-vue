<template>
  <div class="coach-page">
    <div class="page-header">
      <h2 class="page-title"><el-icon><UserFilled /></el-icon><span>教练团队</span></h2>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" v-for="c in list" :key="c.id">
        <el-card shadow="hover" class="coach-card" @click="$router.push(`/coach/${c.id}`)">
          <div class="coach-avatar" :style="{ background: avatarColor(c.id) }">
            {{ c.name.charAt(0) }}
          </div>
          <div class="coach-name">{{ c.name }}</div>
          <div class="coach-intro">{{ c.intro || '暂无简介' }}</div>
          <div class="coach-rating">
            <el-rate :model-value="Number(c.avgRating || 0)" disabled show-score text-color="#e6a23c" />
          </div>
          <div class="coach-tags">
            <el-tag v-for="tag in (c.specialty||'').split(',').filter(Boolean)" :key="tag" size="small" type="warning" effect="plain">{{ tag }}</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="!loading && !list.length" description="暂无教练" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { UserFilled } from '@element-plus/icons-vue'
import { listCoaches } from '../api/coach'

const list = ref([])
const loading = ref(true)
const colors = ['#ff7a2f', '#409eff', '#67c23a', '#e6a23c', '#f56c6c']
const avatarColor = (id) => colors[id % colors.length]

const load = async () => {
  loading.value = true
  try {
    const res = await listCoaches()
    list.value = res.data || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

onMounted(() => load())
</script>

<style scoped>
.coach-page { padding: 4px; }
.page-header { margin-bottom: 16px; }
.page-title { margin: 0; font-size: 22px; font-weight: 700; color: #1f2d3d; display: flex; align-items: center; gap: 8px; }
.coach-card { margin-bottom: 16px; border-radius: 12px; cursor: pointer; transition: transform .2s; }
.coach-card:hover { transform: translateY(-2px); }
.coach-avatar { width: 56px; height: 56px; border-radius: 50%; color: #fff; font-size: 22px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
.coach-name { font-size: 18px; font-weight: 700; color: #1f2d3d; text-align: center; margin-bottom: 8px; }
.coach-intro { font-size: 13px; color: #909399; text-align: center; margin-bottom: 12px; line-height: 1.5; }
.coach-rating { display: flex; justify-content: center; margin-bottom: 10px; }
.coach-tags { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
</style>
