<template>
  <div class="admin-coach-page">
    <div class="page-header">
      <h2 class="page-title"><el-icon><UserFilled /></el-icon><span>教练管理</span></h2>
    </div>

    <el-card shadow="never" class="content-card">
      <div class="toolbar">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增教练</el-button>
      </div>
      <el-table v-loading="loading" :data="list" stripe empty-text="暂无教练">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="intro" label="简介" min-width="200" show-overflow-tooltip />
        <el-table-column prop="specialty" label="擅长" width="180" />
        <el-table-column label="评分" width="100">
          <template #default="{ row }">{{ row.avgRating || '—' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)">
              <template #reference><el-button size="small" type="danger">删除</el-button></template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑教练' : '新增教练'" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="姓名" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="简介" prop="intro"><el-input v-model="form.intro" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="擅长" prop="specialty"><el-input v-model="form.specialty" placeholder="逗号分隔" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { UserFilled, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { listCoaches, addCoach, updateCoach, deleteCoach } from '../api/coach'

const list = ref([])
const loading = ref(true)
const saving = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)

const emptyForm = () => ({ id: null, name: '', intro: '', specialty: '' })
const form = ref(emptyForm())
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  intro: [{ required: true, message: '请输入简介', trigger: 'blur' }]
}

const load = async () => {
  loading.value = true
  try {
    const res = await listCoaches()
    list.value = res.data || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleAdd = () => { form.value = emptyForm(); dialogVisible.value = true }
const handleEdit = (row) => { form.value = JSON.parse(JSON.stringify(row)); dialogVisible.value = true }
const handleDelete = async (id) => { try { await deleteCoach(id); ElMessage.success('已删除'); load() } catch (e) { console.error(e) } }

const save = async () => {
  try { await formRef.value.validate() } catch { return }
  saving.value = true
  try {
    if (form.value.id) await updateCoach(form.value.id, form.value)
    else await addCoach(form.value)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    load()
  } catch (e) { console.error(e) }
  finally { saving.value = false }
}

onMounted(() => load())
</script>

<style scoped>
.admin-coach-page { padding: 4px; }
.page-header { margin-bottom: 16px; }
.page-title { margin: 0; font-size: 22px; font-weight: 700; color: #1f2d3d; display: flex; align-items: center; gap: 8px; }
.content-card { border: none; border-radius: 10px; }
.toolbar { margin-bottom: 12px; }
</style>
