<template>
  <div class="ai-chat-container">
    <!-- 1. 悬浮球 (收起状态) -->
    <div v-if="!visible" class="float-ball" @click="toggleChat">
      <span style="font-size: 30px;">🤖</span>
      <div class="pulse-ring"></div>
    </div>

    <!-- 2. 聊天窗口 (展开状态) -->
    <transition name="el-zoom-in-bottom">
      <div v-if="visible" class="chat-window">
        <!-- Header -->
        <div class="chat-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 24px;">🧠</span>
            <div>
               <div style="font-weight: bold; font-size: 16px;">AI 智能教练</div>
               <div style="font-size: 10px; opacity: 0.8;">基于 RAG 检索增强生成</div>
            </div>
          </div>
          <div class="close-btn" @click="toggleChat">✖</div>
        </div>

        <!-- Message List -->
        <div class="chat-body" ref="scrollRef">
          <div v-for="(msg, index) in messages" :key="index" class="message-row" :class="msg.role">
            <!-- 头像 -->
            <div class="avatar" v-if="msg.role === 'ai'">🤖</div>
            
            <!-- 消息气泡 -->
            <div class="bubble">
               <div v-if="msg.typing" class="typing-indicator">
                 <span></span><span></span><span></span>
               </div>
               <div v-else style="white-space: pre-wrap; line-height: 1.6;">{{ msg.content }}</div>
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
            placeholder="问我：推荐什么课？/ 余额多少？"
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
const messages = ref([
    { role: 'ai', content: '您好！我是您的专属 AI 教练。\n我可以根据您的余额和库存为您推荐课程，或者查询您的会员权益。\n\n试着问我：“给我推荐几节课”' }
])

const toggleChat = () => {
    visible.value = !visible.value
    if (visible.value) scrollToBottom()
}

const scrollToBottom = () => {
    nextTick(() => {
        if (scrollRef.value) {
            scrollRef.value.scrollTop = scrollRef.value.scrollHeight
        }
    })
}

const sendMessage = async () => {
    const text = input.value.trim()
    if (!text) return

    // 1. 用户消息上屏
    messages.value.push({ role: 'user', content: text })
    input.value = ''
    scrollToBottom()
    loading.value = true

    // 2. 添加一个 AI "正在输入" 的占位消息
    const thinkingMsg = { role: 'ai', content: '', typing: true }
    messages.value.push(thinkingMsg)
    scrollToBottom()

    try {
        const userStr = localStorage.getItem('user')
        const user = userStr ? JSON.parse(userStr) : {}
        
        // 3. 调用后端
        const res = await request.post('/ai/chat', {
            userId: user.id, // 如果没登录可能为 undefined，后端需处理
            message: text
        })

        // 4. 移除占位，显示真实回复
        messages.value.pop() // 移除 typing
        
        if (res.code === '200') {
             // 模拟打字机效果
             const fullText = res.data
             const aiMsg = { role: 'ai', content: '' }
             messages.value.push(aiMsg)
             
             let i = 0
             const interval = setInterval(() => {
                 aiMsg.content += fullText.charAt(i)
                 i++
                 scrollToBottom()
                 if (i >= fullText.length) clearInterval(interval)
             }, 30) // 打字速度
        } else {
            messages.value.push({ role: 'ai', content: '系统繁忙，请稍后再试。' })
        }

    } catch (e) {
        messages.value.pop()
        messages.value.push({ role: 'ai', content: '网络连接失败 😭' })
    } finally {
        loading.value = false
        scrollToBottom()
    }
}
</script>

<style scoped>
/* 悬浮球样式 */
.ai-chat-container {
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.float-ball {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    cursor: pointer;
    transition: transform 0.3s;
    position: relative;
}
.float-ball:hover { transform: scale(1.1); }

/* 呼吸灯效果 */
.pulse-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid #764ba2;
    animation: pulse 2s infinite;
}
@keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(1.5); opacity: 0; }
}

/* 聊天窗口样式 */
.chat-window {
    width: 350px;
    height: 500px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 5px 30px rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid #eee;
}

.chat-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.close-btn { cursor: pointer; opacity: 0.8; font-weight: bold; }
.close-btn:hover { opacity: 1; }

.chat-body {
    flex: 1;
    padding: 15px;
    overflow-y: auto;
    background: #f9f9f9;
}

.message-row {
    display: flex;
    margin-bottom: 15px;
    align-items: flex-start;
}
.message-row.user { flex-direction: row-reverse; }

.avatar {
    width: 36px;
    height: 36px;
    background: #eee;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
}
.user-avatar { background: #d9ecff; }

.bubble {
    max-width: 70%;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 14px;
    margin: 0 10px;
    position: relative;
    word-break: break-word;
}
.ai .bubble {
    background: white;
    border: 1px solid #e0e0e0;
    border-top-left-radius: 2px;
    color: #333;
}
.user .bubble {
    background: #409EFF;
    color: white;
    border-top-right-radius: 2px;
}

.chat-footer {
    padding: 10px;
    border-top: 1px solid #eee;
    background: white;
    display: flex;
    gap: 10px;
}
.chat-footer input {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 20px;
    padding: 8px 15px;
    outline: none;
    transition: border 0.3s;
}
.chat-footer input:focus { border-color: #409EFF; }
.chat-footer button {
    width: 40px;
    height: 36px;
    background: #409EFF;
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    font-size: 16px;
}
.chat-footer button:disabled { background: #ccc; cursor: not-allowed; }

/* Typing Indicator */
.typing-indicator span {
    display: inline-block;
    width: 6px;
    height: 6px;
    background-color: #999;
    border-radius: 50%;
    margin: 0 2px;
    animation: typing 1s infinite;
}
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
}
</style>