<template>
  <div class="app-layout">
    <el-container class="main-container">
      
      <!-- 🟢 左侧侧边栏 -->
      <el-aside width="210px" class="sidebar-container">
         <!-- Logo 区域 -->
         <div class="sidebar-logo">
            <span class="logo-icon">🏋️</span>
            <span class="logo-text">Gym Pro</span>
         </div>
        
        <!-- 菜单区域 -->
        <el-menu
          router
          :default-active="activeMenu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          class="el-menu-vertical"
          :unique-opened="true"
        >
          <el-menu-item index="/home">
             <el-icon><HomeFilled /></el-icon>
             <span>系统首页</span>
          </el-menu-item>
          
          <el-menu-item index="/course">
             <el-icon><Calendar /></el-icon>
             <span>预约课程</span>
          </el-menu-item>
          
          <el-menu-item index="/my-booking">
             <el-icon><List /></el-icon>
             <span>我的订单</span>
          </el-menu-item>

          <el-menu-item index="/wallet">
             <el-icon><Wallet /></el-icon>
             <span>我的钱包</span>
          </el-menu-item>

          <!-- 🛡️ 管理员可见区域 -->
          <el-sub-menu index="admin" v-if="user.role === 'admin'">
            <template #title>
                <el-icon><Setting /></el-icon>
                <span>系统管理</span>
            </template>
            <el-menu-item index="/admin-user">用户管理</el-menu-item>
            <el-menu-item index="/admin-course">课程管理</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <!-- 🔵 右侧主体区域 -->
      <el-container>
        <!-- 顶部 Header -->
        <el-header class="navbar">
           <div class="navbar-left">
               <!-- 欢迎语 / 身份标识 -->
               <el-tag v-if="user.role === 'admin'" type="danger" effect="dark" size="small" class="role-badge">
                 🔒 管理员模式
               </el-tag>
               <span v-else class="welcome-msg">
                 👋 欢迎回来，<b>{{ user.username }}</b>
               </span>
           </div>
           
           <div class="navbar-right">
               <!-- 用户下拉菜单 -->
               <el-dropdown trigger="click" @command="handleCommand">
                <div class="avatar-wrapper">
                   <div class="user-avatar">
                      {{ user.username ? user.username.charAt(0).toUpperCase() : 'U' }}
                   </div>
                   <span class="username">{{ user.username }}</span>
                   <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </div>
                <template #dropdown>
                  <el-dropdown-menu class="user-dropdown">
                    <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                    <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
           </div>
        </el-header>

        <!-- 主内容区 (包含路由视图) -->
        <el-main class="app-main">
           <!-- 使用 transition 添加页面淡入淡出+位移动画 -->
           <router-view v-slot="{ Component }">
             <transition name="fade-transform" mode="out-in">
               <component :is="Component" />
             </transition>
           </router-view>
        </el-main>
      </el-container>
    </el-container>

    <!-- ✨ 核心：引入 AI 悬浮组件 (位于最外层，确保不被遮挡) -->
    <!-- 请确保 src/components/AiChat.vue 存在 -->
    <AiChat />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// 引入 Element Plus 图标 (如果没有自动引入插件，需要手动导入)
import { HomeFilled, Calendar, List, Wallet, Setting, ArrowDown } from '@element-plus/icons-vue'
// 引入 AI 组件
import AiChat from '../components/AiChat.vue'

const router = useRouter()
const route = useRoute()
const user = ref({})

// 当前激活的菜单项 (解决刷新后高亮丢失问题)
const activeMenu = computed(() => {
    return route.path
})

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    router.push('/login')
  } else {
    try {
      user.value = JSON.parse(userStr)
    } catch (e) {
      console.error("用户信息解析失败", e)
      logout() // 数据损坏，强制退出
    }
  }
})

const handleCommand = (command) => {
    if (command === 'logout') {
        logout()
    } else if (command === 'profile') {
        router.push('/wallet')
    }
}

const logout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
/* 全屏布局容器 */
.app-layout {
  height: 100vh;
  width: 100vw;
  overflow: hidden; /* 防止出现双重滚动条 */
}

.main-container {
  height: 100%;
}

/* 🟢 侧边栏样式 */
.sidebar-container {
  background-color: #304156;
  height: 100%;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  transition: width 0.3s;
}

.sidebar-logo {
  height: 60px;
  line-height: 60px;
  background: #2b2f3a;
  text-align: center;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
}
.logo-icon { font-size: 24px; }
.logo-text { 
    color: #fff; 
    font-weight: 600; 
    font-size: 18px; 
    font-family: Avenir, Helvetica Neue, Arial, sans-serif; 
    white-space: nowrap;
}

.el-menu-vertical {
  border: none;
  width: 100%;
}

/* 🔵 顶部导航样式 */
.navbar {
  height: 60px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 10; /* 确保阴影在内容之上 */
}

.role-badge {
    margin-right: 5px;
    font-weight: bold;
    letter-spacing: 1px;
}

.welcome-msg {
  color: #606266;
  font-size: 14px;
}

.navbar-right {
    display: flex;
    align-items: center;
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background 0.3s;
}
.avatar-wrapper:hover { background: rgba(0,0,0,0.025); }

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #409EFF 0%, #3a8ee6 100%);
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 8px;
  font-size: 16px;
  box-shadow: 0 2px 5px rgba(64, 158, 255, 0.4);
}
.username {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-right: 5px;
}

/* 🟡 主内容区 */
.app-main {
  background-color: #f0f2f5;
  padding: 20px;
  /* 减去 header 高度 */
  height: calc(100vh - 60px); 
  overflow-y: auto; /* 内容溢出时滚动 */
  position: relative;
}

/* 🪄 页面切换动画 (Fade Transform) */
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>