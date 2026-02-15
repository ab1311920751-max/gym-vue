<template>
  <div class="ai-chat-wrapper">
    <!-- 1. 悬浮球 (收起状态) -->
    <div v-if="!visible" class="float-ball" @click="toggleChat">
      <span class="icon">🤖</span>
      <div class="pulse-ring"></div>
    </div>

    <!-- 2. 聊天窗口 (展开状态) -->
    <transition name="el-zoom-in-bottom">
      <div v-if="visible" class="chat-window">
        <!-- Header -->
        <div class="chat-header">
          <div class="header-info">
            <span class="header-icon">🧠</span>
            <div>
               <div class="header-title">AI 智能教练</div>
               <div class="header-desc">基于 RAG 检索增强生成</div>
            </div>
          </div>
          <div class="close-btn" @click="toggleChat">✖</div>
        </div>

        <!-- Message List -->
        <div class="chat-body" ref="scrollRef">
          <div v-for="(msg, index) in messages" :key="index" class="message-row" :class="msg.role">
            <!-- AI 头像 -->
            <div class="avatar ai-avatar" v-if="msg.role === 'ai'">🤖</div>
            
            <!-- 消息气泡 -->
            <div class="bubble">
               <!-- 正在输入动画 -->
               <div v-if="msg.typing" class="typing-indicator">
                 <span></span><span></span><span></span>
               </div>
               <!-- 文本内容 -->
               <div v-else class="message-content" v-html="formatContent(msg.content)"></div>
            </div>

            <!-- 用户头像 -->
            <div class="avatar user-avatar" v-if="msg.role === 'user'">👤</div>
          </div>
        </div>

        <!-- Footer Input -->
        <div class="chat-footer">
          <input 
            v-model="input" 
            @keyup.enter="sendMessage"
            type="text" 
            placeholder="问我：推荐课程 / 余额多少？"
            :disabled="loading"
          />
          <button @click="sendMessage" :disabled="loading || !input.trim()">
            ➤
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import request from '../utils/request'

const visible = ref(false)
const input = ref('')
const loading = ref(false)
const scrollRef = ref(null)

// 初始欢迎语
const messages = ref([
    { role: 'ai', content: '您好！我是您的专属 AI 教练。\n我可以根据您的 **余额** 和 **库存** 为您推荐课程，或者查询您的 **会员权益**。\n\n试着问我：“给我推荐几节课”' }
])

// 切换开关
const toggleChat = () => {
    visible.value = !visible.value
    if (visible.value) scrollToBottom()
}

// 滚动到底部
const scrollToBottom = () => {
    nextTick(() => {
        if (scrollRef.value) {
            scrollRef.value.scrollTop = scrollRef.value.scrollHeight
        }
    })
}

// 简单的文本格式化（支持换行）
const formatContent = (text) => {
    if (!text) return ''
    return text.replace(/\n/g, '<br>')
}

const sendMessage = async () => {
    const text = input.value.trim()
    if (!text) return

    // 1. 用户消息上屏
    messages.value.push({ role: 'user', content: text })
    input.value = ''
    scrollToBottom()
    loading.value = true

    // 2. 添加 AI "正在思考" 占位符
    const thinkingMsg = { role: 'ai', content: '', typing: true }
    messages.value.push(thinkingMsg)
    scrollToBottom()

    try {
        const userStr = localStorage.getItem('user')
        const user = userStr ? JSON.parse(userStr) : {}
        
        // 3. 调用后端 API
        const res = await request.post('/ai/chat', {
            userId: user.id, 
            message: text
        })

        // 4. 移除占位符
        messages.value.pop() 
        
        if (res.code === '200') {
             // 模拟打字机效果
             const fullText = res.data
             const aiMsg = { role: 'ai', content: '' }
             messages.value.push(aiMsg)
             
             let i = 0
             // 打字速度 (ms)
             const speed = 30 
             const interval = setInterval(() => {
                 aiMsg.content += fullText.charAt(i)
                 i++
                 scrollToBottom()
                 if (i >= fullText.length) clearInterval(interval)
             }, speed)
        } else {
            messages.value.push({ role: 'ai', content: '🤯 AI 大脑过载了，请稍后再试。' })
        }

    } catch (e) {
        messages.value.pop()
        messages.value.push({ role: 'ai', content: '🔴 网络连接失败，请检查后端服务。' })
    } finally {
        loading.value = false
        scrollToBottom()
    }
}
</script>

<style scoped>
.ai-chat-wrapper {
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* 悬浮球 */
.float-ball {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(118, 75, 162, 0.4);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
}
.float-ball:hover { transform: scale(1.1) rotate(10deg); }
.float-ball .icon { font-size: 30px; }

/* 呼吸灯动画 */
.pulse-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid #764ba2;
    animation: pulse 2s infinite;
    pointer-events: none;
}
@keyframes pulse {
    0% { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(1.6); opacity: 0; }
}

/* 聊天窗口 */
.chat-window {
    width: 360px;
    height: 520px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,0.05);
    animation: slideIn 0.3s ease-out;
}
@keyframes slideIn {
    from { opacity: 0; transform: translateY(20px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

/* 头部 */
.chat-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.header-info { display: flex; align-items: center; gap: 10px; }
.header-icon { font-size: 24px; }
.header-title { font-weight: 700; font-size: 16px; letter-spacing: 0.5px; }
.header-desc { font-size: 11px; opacity: 0.85; margin-top: 2px; }
.close-btn { cursor: pointer; font-size: 18px; opacity: 0.8; transition: opacity 0.2s; }
.close-btn:hover { opacity: 1; }

/* 消息体 */
.chat-body {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background: #f4f6f8;
    scroll-behavior: smooth;
}
.chat-body::-webkit-scrollbar { width: 6px; }
.chat-body::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }

.message-row {
    display: flex;
    margin-bottom: 16px;
    align-items: flex-start;
    gap: 8px;
}
.message-row.user { flex-direction: row-reverse; }

.avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.ai-avatar { background: #fff; color: #764ba2; border: 1px solid #eee; }
.user-avatar { background: #409EFF; color: white; }

.bubble {
    max-width: 75%;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.5;
    position: relative;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.ai .bubble {
    background: white;
    border-top-left-radius: 2px;
    color: #333;
}
.user .bubble {
    background: #409EFF;
    color: white;
    border-top-right-radius: 2px;
}

/* 底部输入框 */
.chat-footer {
    padding: 12px;
    border-top: 1px solid #f0f0f0;
    background: white;
    display: flex;
    gap: 8px;
    align-items: center;
}
.chat-footer input {
    flex: 1;
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    padding: 10px 16px;
    outline: none;
    font-size: 14px;
    transition: all 0.3s;
    background: #f9f9f9;
}
.chat-footer input:focus {
    border-color: #764ba2;
    background: white;
    box-shadow: 0 0 0 2px rgba(118, 75, 162, 0.1);
}
.chat-footer button {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
    box-shadow: 0 2px 6px rgba(118, 75, 162, 0.3);
}
.chat-footer button:hover { transform: scale(1.05); }
.chat-footer button:disabled {
    background: #e0e0e0;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
}

/* Typing Indicator */
.typing-indicator { display: flex; align-items: center; height: 21px; }
.typing-indicator span {
    display: inline-block;
    width: 5px;
    height: 5px;
    background-color: #b0b0b0;
    border-radius: 50%;
    margin: 0 2px;
    animation: typing 1.4s infinite ease-in-out both;
}
.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
@keyframes typing {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
}
</style>