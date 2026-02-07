<template>
  <div>
    <h2>👥 会员管理</h2>
    <el-card>
      <el-table :data="tableData" stripe>
        <el-table-column prop="username" label="账号" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="role" label="角色">
           <template #default>
             <el-tag type="success">普通用户</el-tag>
           </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-popconfirm title="确定要注销该用户吗？" @confirm="handleDelete(scope.row.id)">
              <template #reference>
                <el-button type="danger" size="small">注销用户</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'
import { ElMessage } from 'element-plus'

const tableData = ref([])

const loadData = async () => {
  const res = await request.get('/user/list')
  tableData.value = res.data
}

const handleDelete = async (id) => {
  await request.delete(`/user/${id}`)
  ElMessage.success('用户已注销')
  loadData()
}

onMounted(loadData)
</script>