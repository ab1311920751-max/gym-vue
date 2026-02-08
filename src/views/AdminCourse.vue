<template>
  <div>
    <div style="margin-bottom: 20px">
      <el-button type="primary" @click="handleAdd">新增课程</el-button>
    </div>

    <el-table :data="tableData" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="课程名称" />
      <el-table-column prop="coach" label="教练" />
      
      <el-table-column prop="startTime" label="开课时间" width="180">
        <template #default="scope">
          {{ formatTime(scope.row.startTime) }}
        </template>
      </el-table-column>

      <el-table-column prop="price" label="价格" width="100">
         <template #default="scope">￥{{ scope.row.price }}</template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="100" />
      
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-popconfirm title="确定删除吗？" @confirm="handleDelete(scope.row.id)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑课程' : '新增课程'">
      <el-form :model="form" label-width="100px">
        <el-form-item label="课程名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="教练姓名">
          <el-input v-model="form.coach" />
        </el-form-item>
        <el-form-item label="课程简介">
          <el-input type="textarea" v-model="form.content" />
        </el-form-item>
        
        <el-form-item label="开课时间">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择日期时间"
            value-format="YYYY-MM-DDTHH:mm:ss" 
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="课程价格">
          <el-input-number v-model="form.price" :precision="2" :step="10" :min="0" />
        </el-form-item>
        <el-form-item label="库存数量">
          <el-input-number v-model="form.stock" :min="1" :max="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="save">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'
import { ElMessage } from 'element-plus'

const tableData = ref([])
const dialogVisible = ref(false)
const form = ref({})

const load = async () => {
  const res = await request.get('/course/list')
  if (res.code === '200') {
    tableData.value = res.data
  }
}

const handleAdd = () => {
  dialogVisible.value = true
  form.value = { stock: 10, price: 0 } // 默认值
}

const handleEdit = (row) => {
  form.value = JSON.parse(JSON.stringify(row))
  dialogVisible.value = true
}

const handleDelete = async (id) => {
  await request.delete(`/course/${id}`)
  ElMessage.success('删除成功')
  load()
}

const save = async () => {
  try {
    // 根据是否有ID判断是新增还是修改
    if (form.value.id) {
        await request.put('/course', form.value)
    } else {
        await request.post('/course', form.value)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    load()
  } catch(e) {
    console.error(e)
  }
}

// 简单的时间格式化函数
const formatTime = (val) => {
    if (!val) return ''
    return val.replace('T', ' ').substring(0, 16)
}

onMounted(() => load())
</script>