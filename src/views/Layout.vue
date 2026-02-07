<template>
  <div class="layout-container">
    <el-container>
      <el-aside width="200px" class="aside">
        <div class="logo">💪 Gym System</div>
        <el-menu
          router
          :default-active="$route.path"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/home">
            <span>🏠 首页概览</span>
          </el-menu-item>

          <el-menu-item index="/course">
            <span>📅 课程预约</span>
          </el-menu-item>

          <el-menu-item index="/my-booking" v-if="user.role !== 'admin'">
            <span>📝 我的记录</span>
          </el-menu-item>
          
          <el-sub-menu index="1" v-if="user.role === 'admin'">
            <template #title><span>🛠️ 系统管理</span></template>
            <el-menu-item index="/admin/course">课程管理</el-menu-item>
            <el-menu-item index="/admin/user">用户管理</el-menu-item>
          </el-sub-menu>

        </el-menu>
      </el-aside>

      <el-container>
        <el-header class="header">
          <div class="header-left">当前用户：{{ user.nickname }}</div>
          <el-button type="danger" size="small" @click="logout">退出登录</el-button>
        </el-header>

        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || '{}')

// 退出登录
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  ElMessage.success('已退出')
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.el-container {
  height: 100%;
}
.aside {
  background-color: #304156;
  color: white;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-weight: bold;
  font-size: 20px;
  border-bottom: 1px solid #1f2d3d;
}
.header {
  background-color: #fff;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>