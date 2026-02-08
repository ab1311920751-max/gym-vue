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
        <el-menu-item index="/home">
          <span>🏠 首页大屏</span>
        </el-menu-item>
        
        <el-menu-item index="/course">
          <span>📅 课程预约</span>
        </el-menu-item>
        
        <el-menu-item index="/my-booking">
          <span>📝 我的订单</span>
        </el-menu-item>

        <el-sub-menu index="admin">
          <template #title>
            <span>🔧 后台管理</span>
          </template>
          <el-menu-item index="/admin-course">课程管理</el-menu-item>
          <el-menu-item index="/admin-user">用户管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>

    <div class="main-content">
      <div class="header">
        <div class="breadcrumb">欢迎使用健身房预约系统</div>
        <div class="user-info">
          <span style="margin-right: 15px">👤 {{ user.username || '用户' }}</span>
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
import { ref } from 'vue'

const router = useRouter()
const route = useRoute()
const user = JSON.parse(localStorage.getItem('user') || '{}')

const logout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 220px;
  background-color: #304156;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  background-color: #2b3649;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
}

.header {
  height: 60px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}

.content-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

/* 覆盖 Element Menu 默认样式 */
.el-menu {
  border-right: none;
}
</style>