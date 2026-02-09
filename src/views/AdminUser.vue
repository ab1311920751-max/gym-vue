<template>
  <div>
    <div style="margin-bottom: 20px">
      <h2 style="margin: 0">👤 用户管理</h2>
      <p style="color: #999; font-size: 14px">管理员可以在此修改用户余额、会员等级和角色</p>
    </div>

    <el-card>
      <div style="margin-bottom: 20px">
         <el-input v-model="searchText" placeholder="输入用户名搜索" style="width: 200px; margin-right: 10px;" />
         <el-button type="primary" @click="load">查询</el-button>
      </div>

      <el-table :data="filteredData" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        
        <el-table-column prop="role" label="角色" width="120">
            <template #default="scope">
                <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'primary'">
                    {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
                </el-tag>
            </template>
        </el-table-column>

        <el-table-column prop="balance" label="余额" width="120">
            <template #default="scope">
                <span style="color: #f56c6c; font-weight: bold">￥{{ scope.row.balance }}</span>
            </template>
        </el-table-column>

        <el-table-column prop="vipType" label="会员等级" width="120">
            <template #default="scope">
                <el-tag v-if="scope.row.vipType === 2" type="warning" effect="dark">年卡 VIP</el-tag>
                <el-tag v-else-if="scope.row.vipType === 1" type="success" effect="dark">月卡 VIP</el-tag>
                <el-tag v-else type="info">普通会员</el-tag>
            </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="注册时间" width="180" />

        <el-table-column label="操作" min-width="180">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑/充值</el-button>
            <el-popconfirm title="确定删除该用户吗？" @confirm="handleDelete(scope.row.id)">
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="编辑用户信息" width="30%">
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" disabled />
        </el-form-item>
        <el-form-item label="角色">
           <el-select v-model="form.role">
               <el-option label="普通用户" value="user" />
               <el-option label="管理员" value="admin" />
           </el-select>
        </el-form-item>
        <el-form-item label="余额">
          <el-input-number v-model="form.balance" :precision="2" :step="100" />
        </el-form-item>
        <el-form-item label="会员等级">
           <el-select v-model="form.vipType">
               <el-option label="普通会员" :value="0" />
               <el-option label="月卡 VIP" :value="1" />
               <el-option label="年卡 VIP" :value="2" />
           </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="save">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import request from '../utils/request'
import { ElMessage } from 'element-plus'

const tableData = ref([])
const searchText = ref('')
const dialogVisible = ref(false)
const form = ref({})

// 加载数据：调用我们刚才修复的 /user/list 接口
const load = async () => {
  const res = await request.get('/user/list')
  if (res.code === '200') {
    tableData.value = res.data
  }
}

// 前端过滤搜索（简单实现）
const filteredData = computed(() => {
    if (!searchText.value) return tableData.value
    return tableData.value.filter(u => u.username.includes(searchText.value))
})

const handleEdit = (row) => {
  // 深拷贝，防止直接修改表格数据
  form.value = JSON.parse(JSON.stringify(row))
  dialogVisible.value = true
}

const save = async () => {
  try {
      await request.put('/user', form.value)
      ElMessage.success('更新成功')
      dialogVisible.value = false
      load() // 刷新列表
  } catch(e) { console.error(e) }
}

const handleDelete = async (id) => {
  try {
      await request.delete(`/user/${id}`)
      ElMessage.success('删除成功')
      load()
  } catch(e) { console.error(e) }
}

onMounted(() => load())
</script>