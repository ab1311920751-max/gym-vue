<template>
  <div class="login-container">
    <div class="login-box">
      <div class="title">💪 智能健身系统</div>
      
      <el-form :model="form" ref="formRef" :rules="rules">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" size="large">
            <template #prefix>👤</template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password size="large">
            <template #prefix>🔒</template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="login-btn" @click="handleLogin" :loading="loading" size="large">
            立即登录
          </el-button>
        </el-form-item>
        
        <div style="text-align: right;">
          <el-link type="primary" @click="handleRegister">没有账号？去注册</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import request from '../utils/request' // 引入刚才写的工具
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)

// 表单数据
const form = reactive({
  username: '',
  password: ''
})

// 验证规则
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 登录逻辑
const handleLogin = async () => {
  if(!form.username || !form.password) {
    ElMessage.warning('请填写完整信息')
    return
  }

  loading.value = true
  try {
    // 发送请求给后端
    const res = await request.post('/auth/login', form)
    
    // 登录成功
    ElMessage.success('登录成功')
    
    // 1. 保存用户信息和Token到浏览器
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    
    // 2. 跳转到首页 (后面我们会写首页)
    router.push('/') 
    
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// 注册逻辑 (简单复用登录接口，毕设偷懒写法)
const handleRegister = async () => {
   if(!form.username || !form.password) {
    ElMessage.warning('注册也要填账号密码哦')
    return
  }
  try {
    // 注意：这里我们只传 username 和 password
    // 后端会自动设置 balance=0 和 vipType=0
    await request.post('/auth/register', {
        username: form.username,
        password: form.password
    })
    ElMessage.success('注册成功，请点击登录')
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); /* 骚气的渐变紫 */
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
}

.login-btn {
  width: 100%;
}
</style>