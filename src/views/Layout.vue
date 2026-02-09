<template>
  <div class="layout-container">
    <div class="sidebar">
      <div class="logo">💪 健身房系统</div>
      <el-menu
        :default-active="route.path"
        router
        background-color="#304156"
        text-color="#fff"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/home"><span>🏠 首页大屏</span></el-menu-item>
        <el-menu-item index="/course"><span>📅 课程预约</span></el-menu-item>
        <el-menu-item index="/my-booking"><span>📝 我的订单</span></el-menu-item>
        <el-menu-item index="/wallet"><span>💰 我的钱包</span></el-menu-item>

        <el-sub-menu index="admin" v-if="user.role === 'admin'">
          <template #title><span>🔧 后台管理</span></template>
          <el-menu-item index="/admin-course">课程管理</el-menu-item>
          <el-menu-item index="/admin-user">用户管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>

    <div class="main-content">
      <div class="header">
        <div class="breadcrumb">
            欢迎，<span style="font-weight: bold">{{ user.role === 'admin' ? '管理员' : '尊贵的会员' }}</span>
        </div>
        <div class="user-info">
          <span style="margin-right: 15px; color: #F56C6C; font-weight: bold;">
             余额: ￥{{ user.balance ? Number(user.balance).toFixed(2) : '0.00' }}
          </span>
          <span style="margin-right: 15px">👤 {{ user.username }}</span>
          <el-button type="danger" size="small" @click="logout">退出</el-button>
        </div>
      </div>
      
      <div class="content-body">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import request from '../utils/request'

const router = useRouter()
const route = useRoute()
const user = ref({}) 

const logout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  router.push('/login')
}

onMounted(async () => {
    const localStr = localStorage.getItem('user')
    if(localStr) {
        const localUser = JSON.parse(localStr)
        try {
             // 实时查库获取最新信息（包括 role 和 balance）
             const res = await request.get(`/user/${localUser.id}`)
             if(res.code === '200') {
                 user.value = res.data
                 // 同步更新本地缓存，确保刷新后权限状态也是新的
                 localStorage.setItem('user', JSON.stringify(res.data))
             }
        } catch(e) {
             user.value = localUser
        }
    }
})
</script>

<style scoped>
.layout-container { display: flex; height: 100vh; }
.sidebar { width: 220px; background-color: #304156; color: #fff; display: flex; flex-direction: column; }
.logo { height: 60px; line-height: 60px; text-align: center; font-size: 20px; font-weight: bold; background-color: #2b3649; }
.main-content { flex: 1; display: flex; flex-direction: column; background-color: #f0f2f5; }
.header { height: 60px; background-color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; box-shadow: 0 1px 4px rgba(0,21,41,.08); }
.content-body { padding: 20px; flex: 1; overflow-y: auto; }
.el-menu { border-right: none; }
</style>