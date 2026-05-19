<template>
  <div class="course-detail" v-loading="loading">
    <el-empty v-if="!loading && !course.id" description="课程不存在" />
    <template v-else-if="course.id">
      <div class="page-header">
        <div>
          <h2 class="page-title">{{ course.name }}</h2>
          <p class="page-subtitle">{{ course.coach }} · {{ formatTime(course.startTime) }} ~ {{ formatTime(course.endTime) }}</p>
        </div>
        <div class="header-actions">
          <el-button :type="faved ? 'warning' : 'default'" :icon="faved ? StarFilled : Star" @click="toggleFav">{{ faved ? '已收藏' : '收藏' }}</el-button>
          <el-button type="primary" :disabled="course.stock <= 0" :loading="booking" @click="handleBook">立即预约 ￥{{ course.price }}</el-button>
        </div>
      </div>

      <el-row :gutter="20">
        <el-col :xs="24" :md="16">
          <el-card shadow="never" class="info-card">
            <template #header><span>课程详情</span></template>
            <p>{{ course.content || course.description || '暂无简介' }}</p>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="剩余名额">{{ course.stock }}</el-descriptions-item>
              <el-descriptions-item label="价格">￥{{ course.price }}</el-descriptions-item>
              <el-descriptions-item label="教练">{{ course.coach }}</el-descriptions-item>
              <el-descriptions-item label="上课时间">{{ formatTime(course.startTime) }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card shadow="never" class="review-card" style="margin-top:20px">
            <template #header><span>课程评价 ({{ reviews.length }})</span></template>
            <div class="review-form">
              <el-rate v-model="form.rating" />
              <el-input v-model="form.content" type="textarea" :rows="2" placeholder="写评价..." style="margin-top:8px" />
              <el-button type="primary" size="small" style="margin-top:8px" :loading="submitting" @click="submitReview">发表</el-button>
            </div>
            <div v-for="r in reviews" :key="r.id" class="review-item">
              <div class="review-head">
                <span class="review-user">{{ r.username }}</span>
                <el-rate :model-value="r.rating" disabled show-score size="small" />
              </div>
              <div class="review-body">{{ r.content }}</div>
              <div class="review-time">{{ formatTime(r.createTime) }}</div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :md="8">
          <el-card shadow="never" class="side-card">
            <template #header><span>教练信息</span></template>
            <div class="coach-info" v-if="coach.id">
              <div class="coach-name-big">{{ coach.name }}</div>
              <div class="coach-specialty">{{ coach.specialty }}</div>
              <p>{{ coach.intro }}</p>
              <el-rate :model-value="Number(coach.avgRating || 0)" disabled show-score />
            </div>
            <span v-else>暂无教练信息</span>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Star, StarFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { getCourse } from '../api/course'
import { createBooking } from '../api/booking'
import { getReviews, addReview } from '../api/review'
import { addFavorite, removeFavorite, getMyFavorites } from '../api/favorite'
import { getCoach } from '../api/coach'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const booking = ref(false)
const submitting = ref(false)
const course = ref({})
const coach = ref({})
const reviews = ref([])
const faved = ref(false)

const form = reactive({ rating: 5, content: '' })

const load = async () => {
  loading.value = true
  try {
    const res = await getCourse(route.params.id)
    course.value = res.data || {}

    if (course.value.coachId) {
      try {
        const cRes = await getCoach(course.value.coachId)
        coach.value = cRes.data || {}
      } catch (_) {}
    }

    const rRes = await getReviews(route.params.id)
    reviews.value = rRes.data || []

    const fRes = await getMyFavorites()
    const fList = fRes.data || []
    faved.value = fList.some(f => f.courseId === course.value.id)
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleBook = async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (!user.id) { ElMessage.error('请先登录'); router.push('/login'); return }
  booking.value = true
  try {
    const res = await createBooking({ userId: user.id, courseId: course.value.id })
    if (res.code === '200') {
      ElMessageBox.confirm(`预约成功！订单 ID：${res.data}`, '提示', { confirmButtonText: '去支付', type: 'success' })
        .then(() => router.push('/my-booking'))
        .catch(() => {})
      load()
    }
  } catch (e) { console.error(e) }
  finally { booking.value = false }
}

const toggleFav = async () => {
  try {
    if (faved.value) {
      await removeFavorite(course.value.id)
      faved.value = false
      ElMessage.success('已取消收藏')
    } else {
      await addFavorite(course.value.id)
      faved.value = true
      ElMessage.success('已收藏')
    }
  } catch (e) { console.error(e) }
}

const submitReview = async () => {
  if (!form.content) { ElMessage.warning('请输入评价内容'); return }
  submitting.value = true
  try {
    await addReview(course.value.id, { rating: form.rating, content: form.content })
    ElMessage.success('评价成功')
    form.content = ''
    const rRes = await getReviews(route.params.id)
    reviews.value = rRes.data || []
  } catch (e) { console.error(e) }
  finally { submitting.value = false }
}

const formatTime = (v) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '—'

onMounted(() => load())
</script>

<style scoped>
.course-detail { padding: 4px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.page-title { margin: 0; font-size: 24px; font-weight: 700; color: #1f2d3d; }
.page-subtitle { color: #909399; font-size: 14px; margin-top: 4px; }
.header-actions { display: flex; gap: 10px; }
.info-card, .review-card, .side-card { border: none; border-radius: 10px; margin-bottom: 20px; }
.review-form { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #f0f0f0; }
.review-item { padding: 12px 0; border-bottom: 1px solid #f5f5f5; }
.review-head { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
.review-user { font-weight: 600; color: #1f2d3d; }
.review-body { color: #606266; font-size: 14px; line-height: 1.6; }
.review-time { color: #c0c4cc; font-size: 12px; margin-top: 4px; }
.coach-name-big { font-size: 20px; font-weight: 700; color: #1f2d3d; }
.coach-specialty { color: #ff7a2f; font-size: 13px; margin: 4px 0 8px; }
</style>
