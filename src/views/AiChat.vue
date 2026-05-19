<template>
  <div class="ai-chat-page">
    <div class="page-header">
      <h2 class="page-title"><el-icon><ChatDotRound /></el-icon><span>AI 健身助手</span></h2>
    </div>

    <el-row :gutter="20" style="height:calc(100vh - 180px)">
      <el-col :xs="24" :md="6">
        <el-card shadow="never" class="session-list">
          <template #header>
            <div class="list-header">
              <span>历史对话</span>
              <el-button :icon="Plus" size="small" circle @click="newSession" />
            </div>
          </template>
          <div v-for="s in sessions" :key="s.id" class="session-item" :class="{ active: s.id === activeId }" @click="selectSession(s.id)">
            <div class="session-title">{{ s.title || '新对话' }}</div>
            <div class="session-actions">
              <span class="session-time">{{ formatTime(s.updateTime) }}</span>
              <el-button :icon="Delete" size="small" text @click.stop="handleDeleteSession(s.id)" />
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="18">
        <el-card shadow="never" class="chat-area">
          <div class="messages-box" ref="msgBox">
            <div v-for="(m, i) in messages" :key="i" :class="['msg', m.role === 'user' ? 'msg-user' : 'msg-ai']">
              <div class="msg-content">{{ m.content }}</div>
              <div class="msg-time">{{ formatTime(m.createTime) }}</div>
            </div>
            <div v-if="sending" class="msg msg-ai">
              <el-icon class="is-loading"><Loading /></el-icon>
            </div>
          </div>
          <div class="input-area">
            <el-input v-model="input" type="textarea" :rows="2" placeholder="输入你的健身问题..." @keyup.enter.exact.prevent="send" />
            <el-button type="primary" :disabled="!input.trim() || sending" @click="send" style="margin-top:8px">发送</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { ChatDotRound, Plus, Delete, Loading } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { chat, getMySessions, getMessages, deleteSession } from '../api/ai'

const sessions = ref([])
const activeId = ref(null)
const messages = ref([])
const input = ref('')
const sending = ref(false)
const msgBox = ref(null)

const loadSessions = async () => {
  try {
    const res = await getMySessions()
    sessions.value = res.data || []
  } catch (e) { console.error(e) }
}

const newSession = () => {
  activeId.value = null
  messages.value = []
  input.value = ''
}

const selectSession = async (id) => {
  activeId.value = id
  try {
    const res = await getMessages(id)
    messages.value = res.data || []
    await nextTick()
    scrollBottom()
  } catch (e) { console.error(e) }
}

const send = async () => {
  if (!input.value.trim() || sending.value) return
  const msg = input.value.trim()
  input.value = ''
  messages.value.push({ role: 'user', content: msg, createTime: new Date().toISOString() })
  sending.value = true
  await nextTick()
  scrollBottom()
  try {
    const res = await chat({ sessionId: activeId.value, message: msg })
    if (!activeId.value) {
      activeId.value = res.data.sessionId
      loadSessions()
    }
    messages.value.push({ role: 'assistant', content: res.data.reply, createTime: new Date().toISOString() })
  } catch (e) { console.error(e) }
  finally { sending.value = false }
  await nextTick()
  scrollBottom()
}

const handleDeleteSession = async (id) => {
  try {
    await deleteSession(id)
    if (activeId.value === id) newSession()
    loadSessions()
  } catch (e) { console.error(e) }
}

const scrollBottom = () => {
  if (msgBox.value) msgBox.value.scrollTop = msgBox.value.scrollHeight
}

const formatTime = (v) => v ? dayjs(v).format('MM-DD HH:mm') : ''

onMounted(() => loadSessions())
</script>

<style scoped>
.ai-chat-page { padding: 4px; }
.page-header { margin-bottom: 16px; }
.page-title { margin: 0; font-size: 22px; font-weight: 700; color: #1f2d3d; display: flex; align-items: center; gap: 8px; }
.session-list { border: none; border-radius: 10px; height: 100%; overflow-y: auto; }
.list-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
.session-item { padding: 10px 12px; border-radius: 8px; cursor: pointer; margin-bottom: 4px; transition: background .15s; }
.session-item:hover, .session-item.active { background: #fff5ee; }
.session-title { font-size: 14px; color: #1f2d3d; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.session-time { font-size: 11px; color: #c0c4cc; }
.session-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 2px; }
.chat-area { border: none; border-radius: 10px; height: 100%; display: flex; flex-direction: column; }
.messages-box { flex: 1; overflow-y: auto; padding-right: 8px; }
.msg { margin-bottom: 14px; }
.msg-user .msg-content { background: linear-gradient(135deg, #ff8c42, #ff6b1a); color: #fff; margin-left: auto; border-radius: 12px 12px 0 12px; }
.msg-ai .msg-content { background: #f5f7fa; color: #1f2d3d; border-radius: 12px 12px 12px 0; }
.msg-content { max-width: 70%; padding: 10px 14px; line-height: 1.5; font-size: 14px; word-break: break-word; }
.msg-user { display: flex; flex-direction: column; align-items: flex-end; }
.msg-time { font-size: 11px; color: #c0c4cc; margin-top: 4px; }
.input-area { padding-top: 12px; border-top: 1px solid #f0f0f0; }
</style>
