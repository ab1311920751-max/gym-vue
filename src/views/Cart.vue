<template>
  <div class="cart-page">
    <div class="page-header">
      <h2 class="page-title"><el-icon><ShoppingCart /></el-icon><span>购物车</span></h2>
    </div>

    <el-card shadow="never" class="content-card">
      <el-table v-loading="loading" :data="list" stripe empty-text="购物车是空的" @selection-change="handleSelect">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="courseName" label="课程" min-width="160" />
        <el-table-column prop="coach" label="教练" width="120" />
        <el-table-column label="上课时间" width="170">
          <template #default="{ row }">{{ formatTime(row.startTime) }}</template>
        </el-table-column>
        <el-table-column label="价格" width="100">
          <template #default="{ row }"><span class="price">￥{{ row.price }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="handleRemove(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="checkout-bar">
        <el-button type="primary" size="large" :disabled="!selected.length" @click="handleCheckout">
          结算 ({{ selected.length }})
        </el-button>
      </div>
    </el-card>

    <el-dialog v-model="resultVisible" title="结算结果" width="480px">
      <div v-for="item in checkoutResults" :key="item.bookingId" class="result-row">
        <span>{{ item.courseName }}</span>
        <el-tag size="small" type="warning">待支付</el-tag>
      </div>
      <template #footer>
        <el-button type="primary" @click="$router.push('/my-booking')">去支付</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ShoppingCart } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { getCart, addToCart, removeFromCart, checkout } from '../api/cart'

const list = ref([])
const loading = ref(true)
const selected = ref([])
const checkoutResults = ref([])
const resultVisible = ref(false)

const load = async () => {
  loading.value = true
  try {
    const res = await getCart()
    list.value = res.data || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleSelect = (rows) => { selected.value = rows }

const handleRemove = async (id) => {
  try {
    await removeFromCart(id)
    ElMessage.success('已删除')
    load()
  } catch (e) { console.error(e) }
}

const handleCheckout = async () => {
  try {
    const res = await checkout()
    checkoutResults.value = res.data || []
    resultVisible.value = true
    load()
  } catch (e) { console.error(e) }
}

const formatTime = (v) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '—'

onMounted(() => load())
</script>

<style scoped>
.cart-page { padding: 4px; }
.page-header { margin-bottom: 16px; }
.page-title { margin: 0; font-size: 22px; font-weight: 700; color: #1f2d3d; display: flex; align-items: center; gap: 8px; }
.content-card { border: none; border-radius: 10px; }
.price { color: #ff7a2f; font-weight: 700; }
.checkout-bar { margin-top: 16px; text-align: right; }
.result-row { display: flex; justify-content: space-between; padding: 8px 0; }
</style>
