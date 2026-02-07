<template>
  <div class="home-box">
    <el-card>
      <h2>👋 欢迎回来，{{ user.nickname }}！</h2>
      <p class="role-tag">当前身份：
        <el-tag :type="user.role === 'admin' ? 'danger' : 'success'">
          {{ user.role === 'admin' ? '管理员' : '普通会员' }}
        </el-tag>
      </p>
      <p class="desc">这里是智能健身预约系统。开始你的锻炼计划吧！</p>
      
      <div style="margin-top: 20px;">
        <el-button type="primary" @click="$router.push('/course')">去预约课程</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 从浏览器缓存获取用户信息
const userStr = localStorage.getItem('user')
const user = ref(userStr ? JSON.parse(userStr) : { nickname: '用户', role: 'user' })
</script>

<style scoped>
.home-box {
  padding: 20px;
}
.role-tag {
  margin: 10px 0;
  color: #666;
}
.desc {
  font-size: 14px;
  color: #888;
}
</style>