<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="8">
         <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>👤 用户档案</span>
              </div>
            </template>
            <div style="display: flex; align-items: center; gap: 10px;">
               <h3 style="margin: 0">{{ user.username }}</h3>
               <el-tag v-if="user.vipType === 0" type="info" effect="dark">普通会员</el-tag>
               <el-tag v-else-if="user.vipType === 1" color="#409EFF" effect="dark" style="color: white">月卡 VIP (9折)</el-tag>
               <el-tag v-else-if="user.vipType === 2" color="#d9ecff" effect="dark" style="color: #b88230; font-weight: bold; background-color: #fdf6ec; border-color: #e6a23c;">👑 年卡 VIP (8折)</el-tag>
            </div>
         </el-card>
      </el-col>
      
      <el-col :span="16">
         <el-card shadow="hover" style="background: linear-gradient(to right, #fdfbfb, #ebedee);">
            <template #header>
              <div class="card-header">
                <span>💰 账户余额</span>
              </div>
            </template>
            <div style="display: flex; align-items: center; justify-content: space-between;">
               <span style="font-size: 36px; font-weight: bold; color: #F56C6C; font-family: monospace;">
                 ￥{{ user.balance ? Number(user.balance).toFixed(2) : '0.00' }}
               </span>
               <el-button type="success" size="large" @click="dialogVisible = true">💰 立即充值</el-button>
            </div>
         </el-card>
      </el-col>
    </el-row>

    <div style="margin-top: 30px">
        <h3>👑 会员专区 (升级立享抢课折扣)</h3>
        <el-row :gutter="20">
            <el-col :span="12">
                <el-card shadow="hover" class="vip-card" :class="{ 'active': user.vipType === 1 }">
                    <div style="text-align: center; padding: 20px;">
                        <h2 style="color: #409EFF">🗓️ 月卡 VIP</h2>
                        <h1 style="color: #303133">￥30.00</h1>
                        <p style="color: #909399">有效期 30 天 | 全场课程 9 折</p>
                        <el-button 
                            type="primary" 
                            plain 
                            :disabled="user.vipType >= 1"
                            @click="handleBuyVip(1)">
                            {{ user.vipType === 1 ? '当前生效中' : (user.vipType === 2 ? '已有更高等级' : '立即开通') }}
                        </el-button>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card shadow="hover" class="vip-card" :class="{ 'active': user.vipType === 2 }" style="border: 1px solid #e6a23c;">
                    <div style="text-align: center; padding: 20px;">
                        <h2 style="color: #E6A23C">🏆 年卡 VIP</h2>
                        <h1 style="color: #303133">￥300.00</h1>
                        <p style="color: #909399">有效期 365 天 | 全场课程 8 折</p>
                        <el-button 
                            type="warning" 
                            effect="dark"
                            :disabled="user.vipType === 2"
                            @click="handleBuyVip(2)">
                            {{ user.vipType === 2 ? '尊贵身份生效中' : '立即开通' }}
                        </el-button>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>

    <el-dialog v-model="dialogVisible" title="💰 余额充值" width="30%">
        <div style="text-align: center; margin: 20px 0;">
            <el-input-number v-model="rechargeAmount" :min="10" :step="100" size="large" />
            <p style="margin-top: 10px; color: #666;">支持支付宝/微信 (模拟)</p>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleRecharge">确认支付</el-button>
            </span>
        </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const user = ref({})
const dialogVisible = ref(false)
const rechargeAmount = ref(100)

const loadUser = async () => {
    const localUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (!localUser.id) return
    try {
        const res = await request.get(`/user/${localUser.id}`)
        if (res.code === '200') {
            user.value = res.data
            localStorage.setItem('user', JSON.stringify(res.data))
        }
    } catch(e) { console.error(e) }
}

// 充值逻辑
const handleRecharge = async () => {
    try {
        const res = await request.post('/user/recharge', {
            userId: user.value.id,
            amount: rechargeAmount.value
        })
        if (res.code === '200') {
            ElMessage.success(`充值 ${rechargeAmount.value} 元成功！`)
            dialogVisible.value = false
            loadUser()
            // 🔥 关键点：充值成功后，通知右上角更新
            window.dispatchEvent(new Event('refresh-user'))
        } else {
            ElMessage.error(res.msg)
        }
    } catch(e) { console.error(e) }
}

// 购买 VIP 逻辑
const handleBuyVip = (type) => {
    const price = type === 1 ? 30 : 300
    if (user.value.balance < price) {
        ElMessage.warning('余额不足，请先充值！')
        dialogVisible.value = true
        return
    }

    ElMessageBox.confirm(
        `确认花费 ${price} 元开通 ${type === 1 ? '月卡' : '年卡'} 吗？`,
        '升级确认',
        { confirmButtonText: '确认开通', cancelButtonText: '取消', type: 'warning' }
    ).then(async () => {
        try {
            const res = await request.post('/user/buyVip', {
                userId: user.value.id,
                vipType: type
            })
            if (res.code === '200') {
                ElMessage.success('VIP 身份已生效！')
                loadUser()
                // 🔥 关键点：升级成功后，通知右上角更新
                window.dispatchEvent(new Event('refresh-user'))
            } else {
                ElMessage.error(res.msg)
            }
        } catch(e) { console.error(e) }
    })
}

onMounted(() => loadUser())
</script>

<style scoped>
.vip-card { transition: transform 0.3s; cursor: pointer; }
.vip-card:hover { transform: translateY(-5px); }
.active { border: 2px solid #67C23A; background-color: #f0f9eb; }
</style>