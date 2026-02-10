<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="8">
         <el-card shadow="hover">
            <template #header><span>👤 用户档案</span></template>
            <div style="display: flex; align-items: center; gap: 10px;">
               <h3 style="margin: 0">{{ user.username }}</h3>
               <el-tag v-if="user.vipType === 0" type="info">普通会员</el-tag>
               <el-tag v-else-if="user.vipType === 1" type="primary">月卡 VIP</el-tag>
               <el-tag v-else-if="user.vipType === 2" type="warning">👑 年卡 VIP</el-tag>
            </div>
         </el-card>
      </el-col>
      <el-col :span="16">
         <el-card shadow="hover" style="background: linear-gradient(to right, #fdfbfb, #ebedee);">
            <template #header><span>💰 账户余额</span></template>
            <div style="display: flex; align-items: center; justify-content: space-between;">
               <span style="font-size: 36px; font-weight: bold; color: #F56C6C;">
                 ￥{{ user.balance ? Number(user.balance).toFixed(2) : '0.00' }}
               </span>
               <el-button type="primary" size="large" @click="dialogVisible = true">
                 <img src="https://img.icons8.com/color/48/alipay.png" style="width:20px; vertical-align:middle; margin-right:5px"/>
                 支付宝充值
               </el-button>
            </div>
         </el-card>
      </el-col>
    </el-row>

    <div style="margin-top: 30px">
        <h3>👑 会员专区</h3>
        <el-row :gutter="20">
            <el-col :span="12">
                <el-card shadow="hover" class="vip-card" :class="{ 'active': user.vipType === 1 }">
                    <div style="text-align: center; padding: 20px;">
                        <h2 style="color: #409EFF">🗓️ 月卡 VIP</h2>
                        <h1 style="color: #303133">￥30.00</h1>
                        <el-button type="primary" plain :disabled="user.vipType >= 1" @click="handleBuyVip(1)">立即开通</el-button>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card shadow="hover" class="vip-card" :class="{ 'active': user.vipType === 2 }" style="border: 1px solid #e6a23c;">
                    <div style="text-align: center; padding: 20px;">
                        <h2 style="color: #E6A23C">🏆 年卡 VIP</h2>
                        <h1 style="color: #303133">￥300.00</h1>
                        <el-button type="warning" effect="dark" :disabled="user.vipType === 2" @click="handleBuyVip(2)">立即开通</el-button>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>

    <el-dialog v-model="dialogVisible" title="💰 支付宝充值" width="30%">
        <div style="text-align: center; margin: 20px 0;">
            <el-input-number v-model="rechargeAmount" :min="10" :step="100" size="large" />
            <p style="margin-top: 10px; color: #666; font-size: 12px">
               点击确认后将跳转至支付宝沙箱支付页<br>
               (账号: tbqsks2385@sandbox.com / 密码: 111111)
            </p>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleAlipay">前往支付</el-button>
            </span>
        </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '../utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
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
    } catch(e) {}
}

// 1. 发起支付宝支付
const handleAlipay = () => {
    // 生成一个带时间戳的唯一订单号
    const traceNo = Date.now() + Math.floor(Math.random() * 1000)
    // 拼接后端支付接口地址
    // 注意：这里用 window.open 打开新窗口，避免当前页面被覆盖
    const payUrl = `http://localhost:8080/alipay/pay?subject=健身房充值&traceNo=${traceNo}&totalAmount=${rechargeAmount.value}`
    
    window.open(payUrl, '_blank')
    
    ElMessageBox.confirm('支付完成后请点击确认刷新余额', '支付确认', {
        confirmButtonText: '我已支付',
        cancelButtonText: '遇到问题',
        type: 'success'
    }).then(() => {
        // 其实用户点确认时，如果回调还没跑完，可能查不到钱
        // 但我们在 onMounted 里处理了自动回调，这里只是兜底
        loadUser()
        window.dispatchEvent(new Event('refresh-user'))
    })
    
    dialogVisible.value = false
}

// 2. 检查支付回调
// 当支付宝跳回 http://localhost:5173/wallet?pay=success&... 时触发
const checkPayCallback = async () => {
    if (route.query.pay === 'success') {
        const out_trade_no = route.query.out_trade_no
        const total_amount = route.query.total_amount
        
        // 调用后端接口确认加钱
        try {
            const res = await request.post('/alipay/success', {
                out_trade_no: out_trade_no,
                total_amount: total_amount,
                userId: user.value.id // 必须传 userId
            })
            if (res === 'success') {
                ElMessage.success(`充值 ${total_amount} 元到账成功！`)
                loadUser()
                window.dispatchEvent(new Event('refresh-user'))
                
                // 清除 URL 参数，防止刷新重复加钱 (虽然可以用订单号幂等性控制，简单起见先清URL)
                router.replace('/wallet')
            }
        } catch(e) { console.error(e) }
    }
}

// 购买 VIP 逻辑 (保持不变)
const handleBuyVip = (type) => {
    const price = type === 1 ? 30 : 300
    if (user.value.balance < price) {
        ElMessage.warning('余额不足，请先充值！')
        dialogVisible.value = true
        return
    }
    ElMessageBox.confirm(`确认花费 ${price} 元开通吗？`, '提示', { confirmButtonText: '确定', cancelButtonText: '取消' })
    .then(async () => {
        await request.post('/user/buyVip', { userId: user.value.id, vipType: type })
        ElMessage.success('开通成功')
        loadUser()
        window.dispatchEvent(new Event('refresh-user'))
    })
}

onMounted(async () => {
    // 先加载用户，拿到 userId
    const localUser = JSON.parse(localStorage.getItem('user') || '{}')
    user.value = localUser
    
    // 检查是否刚从支付宝跳回来
    if (route.query.pay === 'success' && localUser.id) {
        await checkPayCallback()
    }
    
    // 再刷一次最新余额
    loadUser()
})
</script>