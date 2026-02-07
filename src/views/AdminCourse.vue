<template>
  <div>
    <div style="margin-bottom: 20px;">
      <el-button type="primary" @click="handleAdd">➕ 发布新课程</el-button>
    </div>

    <el-card>
      <el-table :data="tableData" stripe>
        <el-table-column prop="name" label="课程名称" />
        <el-table-column prop="coach" label="教练" />
        <el-table-column prop="startTime" label="时间" />
        <el-table-column prop="capacity" label="容量" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-popconfirm title="确定删除吗？" @confirm="handleDelete(scope.row.id)">
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑课程' : '新增课程'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="课程名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="教练">
          <el-input v-model="form.coach" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
        <el-form-item label="时间">
           <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择时间" value-format="YYYY-MM-DD HH:mm:ss"/>
        </el-form-item>
        <el-form-item label="容量">
          <el-input-number v-model="form.capacity" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCourse">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '../utils/request'
import { ElMessage } from 'element-plus'

const tableData = ref([])
const dialogVisible = ref(false)
const form = reactive({ id: null, name: '', coach: '', description: '', startTime: '', capacity: 20 })

const loadData = async () => {
  const res = await request.get('/course/list')
  tableData.value = res.data
}

// 打开新增
const handleAdd = () => {
  form.id = null
  form.name = ''
  form.coach = ''
  form.description = ''
  form.startTime = ''
  dialogVisible.value = true
}

// 打开编辑
const handleEdit = (row) => {
  Object.assign(form, row) // 把行数据复制给表单
  dialogVisible.value = true
}

// 保存
const saveCourse = async () => {
  await request.post('/course/save', form)
  ElMessage.success('保存成功')
  dialogVisible.value = false
  loadData()
}

// 删除
const handleDelete = async (id) => {
  await request.delete(`/course/${id}`)
  ElMessage.success('删除成功')
  loadData()
}

onMounted(loadData)
</script>