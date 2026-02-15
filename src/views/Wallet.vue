<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="8">
         <el-card shadow="hover">
            <template #header><span>👤 用户档案</span></template>
            <div style="display: flex; flex-direction: column; gap: 15px;">
               <div style="display: flex; align-items: center; gap: 10px;">
                   <h3 style="margin: 0">{{ user.username }}</h3>
                   <el-tag v-if="user.vipType === 0" type="info">普通会员</el-tag>
                   <el-tag v-else-if="user.vipType === 1" type="primary">月卡 VIP</el-tag>
                   <el-tag v-else-if="user.vipType === 2" type="warning">👑 年卡 VIP</el-tag>
               </div>
               
               <!-- ✨ 新增：VIP 有效期展示 -->
               <div v-if="user.vipType > 0" style="font-size: 13px; color: #666; background: #f4f4f5; padding: 10px; border-radius: 4px;">
                   <span style="font-weight: bold;">📅 到期时间：</span>
                   <span :style="{ color: isExpiringSoon(user.vipExpireTime) ? 'red' : '#333' }">
                       {{ formatDate(user.vipExpireTime) }}
                   </span>
                   <div v-if="isExpiringSoon(user.vipExpireTime)" style="margin-top: 5px; color: red; font-size: 12px;">
                       (即将过期，请及时续费)
                   </div>
               </div>
               <div v-else style="font-size: 13px; color: #999;">
                   暂未开通 VIP，享受 9 折/ 8 折购课优惠
               </div>
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
        <h3>👑 会员专区 (支持续费叠加)</h3>
        <el-row :gutter="20">
            <el-col :span="12">
                <el-card shadow="hover" class="vip-card" :class="{ 'active': user.vipType === 1 }">
                    <div style="text-align: center; padding: 20px;">
                        <h2 style="color: #409EFF">🗓️ 月卡 VIP</h2>
                        <h1 style="color: #303133">￥30.00 <span style="font-size: 14px; color: #999; font-weight: normal">/ 月</span></h1>
                        <ul style="text-align: left; color: #666; font-size: 14px; margin: 15px 0;">
                            <li>全场课程 9 折优惠</li>
                            <li>专属 VIP 标识</li>
                            <li>优先抢课通道</li>
                        </ul>
                        <!-- 逻辑变更：现在允许续费，所以去掉了 disabled -->
                        <el-button type="primary" plain @click="handleBuyVip(1)">
                            {{ user.vipType === 1 ? '立即续费 (+30天)' : '立即开通' }}
                        </el-button>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card shadow="hover" class="vip-card" :class="{ 'active': user.vipType === 2 }" style="border: 1px solid #e6a23c;">
                    <div style="text-align: center; padding: 20px;">
                        <h2 style="color: #E6A23C">🏆 年卡 VIP</h2>
                        <h1 style="color: #303133">￥300.00 <span style="font-size: 14px; color: #999; font-weight: normal">/ 年</span></h1>
                         <ul style="text-align: left; color: #666; font-size: 14px; margin: 15px 0;">
                            <li>全场课程 8 折钜惠</li>
                            <li>尊贵皇冠标识</li>
                            <li>所有月卡权益</li>
                        </ul>
                        <el-button type="warning" effect="dark" @click="handleBuyVip(2)">
                             {{ user.vipType === 2 ? '立即续费 (+365天)' : '升级/开通' }}
                        </el-button>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>

    <!-- 充值弹窗保持不变 -->
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
import dayjs from 'dayjs' // 引入时间处理库

const route = useRoute()
const router = useRouter()
const user = ref({})
const dialogVisible = ref(false)
const rechargeAmount = ref(100)

// 时间格式化工具
const formatDate = (dateStr) => {
    if (!dateStr) return '永久有效'
    return dayjs(dateStr).format('YYYY年MM月DD日 HH:mm:ss 到期')
}

// 判断是否即将过期 (7天内)
const isExpiringSoon = (dateStr) => {
    if (!dateStr) return false
    const expireTime = dayjs(dateStr)
    const now = dayjs()
    return expireTime.diff(now, 'day') <= 7 && expireTime.isAfter(now)
}

const loadUser = async () => {
    const localUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (!localUser.id) return
    try {
        const res = await request.get(`/user/${localUser.id}`)
        if (res.code === '200') {
            user.value = res.data
            // 更新本地缓存
            localStorage.setItem('user', JSON.stringify(res.data))
        }
    } catch(e) {}
}

const handleAlipay = () => {
    const traceNo = Date.now() + Math.floor(Math.random() * 1000)
    // 这里如果端口不是 8080，请修改
    const payUrl = `http://localhost:8080/alipay/pay?subject=健身房充值&traceNo=${traceNo}&totalAmount=${rechargeAmount.value}`
    
    window.open(payUrl, '_blank')
    
    ElMessageBox.confirm('支付完成后请点击确认刷新余额', '支付确认', {
        confirmButtonText: '我已支付',
        cancelButtonText: '遇到问题',
        type: 'success'
    }).then(() => {
        loadUser()
        window.dispatchEvent(new Event('refresh-user'))
    })
    
    dialogVisible.value = false
}

const checkPayCallback = async () => {
    if (route.query.pay === 'success') {
        const out_trade_no = route.query.out_trade_no
        const total_amount = route.query.total_amount
        
        try {
            const res = await request.post('/alipay/success', {
                out_trade_no: out_trade_no,
                total_amount: total_amount,
                userId: user.value.id
            })
            if (res.code === '200') {
                ElMessage.success(`充值 ${total_amount} 元到账成功！`)
                loadUser()
                window.dispatchEvent(new Event('refresh-user'))
                router.replace('/wallet')
            }
        } catch(e) { console.error(e) }
    }
}

// 购买/续费 VIP
const handleBuyVip = (type) => {
    const price = type === 1 ? 30 : 300
    if (user.value.balance < price) {
        ElMessage.warning('余额不足，请先充值！')
        dialogVisible.value = true
        return
    }
    
    const actionText = user.value.vipType === type ? '续费' : '开通'
    
    ElMessageBox.confirm(`确认花费 ${price} 元${actionText}吗？`, '提示', { 
        confirmButtonText: '确定扣款', 
        cancelButtonText: '取消',
        type: 'warning'
    })
    .then(async () => {
        // 这里的参数结构 { userId, vipType } 完美匹配后端的 UserDTO
        await request.post('/user/buyVip', { userId: user.value.id, vipType: type })
        ElMessage.success(`${actionText}成功！`)
        loadUser()
        window.dispatchEvent(new Event('refresh-user'))
    })
}

onMounted(async () => {
    const localUser = JSON.parse(localStorage.getItem('user') || '{}')
    user.value = localUser
    
    if (route.query.pay === 'success' && localUser.id) {
        await checkPayCallback()
    }
    loadUser()
})
</script>

<style scoped>
.vip-card {
    transition: all 0.3s;
    border: 1px solid #EBEEF5;
    cursor: pointer;
}
.vip-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}
.vip-card.active {
    background-color: #f0f9eb;
    border-color: #67c23a;
    position: relative;
}
.vip-card.active::after {
    content: '当前等级';
    position: absolute;
    top: 0;
    right: 0;
    background: #67c23a;
    color: white;
    padding: 2px 8px;
    font-size: 12px;
    border-bottom-left-radius: 8px;
}
</style>