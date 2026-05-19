<template>
  <div class="admin-knowledge-page">
    <div class="page-header">
      <h2 class="page-title"><el-icon><Document /></el-icon><span>AI 知识库</span></h2>
    </div>

    <el-card shadow="never" class="content-card">
      <div class="toolbar">
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增条目</el-button>
      </div>
      <el-table v-loading="loading" :data="list" stripe empty-text="暂无条目">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="keywords" label="关键词" width="160" />
        <el-table-column prop="question" label="问题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="answer" label="答案" min-width="240" show-overflow-tooltip />
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

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑条目' : '新增条目'" width="560px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="70px">
        <el-form-item label="分类" prop="category"><el-input v-model="form.category" /></el-form-item>
        <el-form-item label="关键词" prop="keywords"><el-input v-model="form.keywords" placeholder="逗号分隔" /></el-form-item>
        <el-form-item label="问题" prop="question"><el-input v-model="form.question" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="答案" prop="answer"><el-input v-model="form.answer" type="textarea" :rows="4" /></el-form-item>
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
import { Document, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { listKnowledge, addKnowledge, updateKnowledge, deleteKnowledge } from '../api/ai'

const list = ref([])
const loading = ref(true)
const saving = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)

const emptyForm = () => ({ id: null, category: '', keywords: '', question: '', answer: '' })
const form = ref(emptyForm())
const rules = {
  category: [{ required: true, message: '请输入分类', trigger: 'blur' }],
  question: [{ required: true, message: '请输入问题', trigger: 'blur' }],
  answer: [{ required: true, message: '请输入答案', trigger: 'blur' }]
}

const load = async () => {
  loading.value = true
  try {
    const res = await listKnowledge()
    list.value = res.data || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleAdd = () => { form.value = emptyForm(); dialogVisible.value = true }
const handleEdit = (row) => { form.value = JSON.parse(JSON.stringify(row)); dialogVisible.value = true }
const handleDelete = async (id) => { try { await deleteKnowledge(id); ElMessage.success('已删除'); load() } catch (e) { console.error(e) } }

const save = async () => {
  try { await formRef.value.validate() } catch { return }
  saving.value = true
  try {
    if (form.value.id) await updateKnowledge(form.value.id, form.value)
    else await addKnowledge(form.value)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    load()
  } catch (e) { console.error(e) }
  finally { saving.value = false }
}

onMounted(() => load())
</script>

<style scoped>
.admin-knowledge-page { padding: 4px; }
.page-header { margin-bottom: 16px; }
.page-title { margin: 0; font-size: 22px; font-weight: 700; color: #1f2d3d; display: flex; align-items: center; gap: 8px; }
.content-card { border: none; border-radius: 10px; }
.toolbar { margin-bottom: 12px; }
</style>
