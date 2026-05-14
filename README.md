# gym-vue - 前端模块

基于 Vue 3 + Vite + Element Plus 的智能健身预约系统前端。

## 项目结构

```
gym-vue/
├── index.html                  # HTML 入口（集成 Coze AI SDK）
├── package.json                # 依赖配置
├── vite.config.js              # Vite 构建配置
├── db_backups/
│   └── gym_db4.sql             # 数据库备份
├── public/
└── src/
    ├── App.vue                 # 根组件
    ├── main.js                 # 应用入口
    ├── style.css               # 全局样式
    ├── assets/
    ├── components/
    │   ├── AiChat.vue          # AI 聊天悬浮组件
    │   └── HelloWorld.vue      # 模板示例组件
    ├── router/
    │   └── index.js            # Vue Router 路由配置 + 导航守卫
    ├── utils/
    │   └── request.js          # Axios 请求封装
    └── views/
        ├── AdminCourse.vue     # 管理员课程管理
        ├── AdminUser.vue       # 管理员用户管理
        ├── Course.vue          # 课程预约页面
        ├── Home.vue            # 首页仪表盘
        ├── Layout.vue          # 主布局框架
        ├── Login.vue           # 登录注册页
        ├── MyBooking.vue       # 我的订单
        ├── PaySuccess.vue      # 支付结果页
        └── Wallet.vue          # 我的钱包
```

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.4.19 | 前端框架（Composition API） |
| Vite | 5.1.4 | 开发与构建工具 |
| Element Plus | 2.5.6 | UI 组件库 |
| Vue Router | 4.2.5 | 单页路由 |
| Axios | 1.6.7 | HTTP 客户端 |
| ECharts | 6.0.0 | 数据可视化图表 |

## 页面说明

### 路由结构

```
/login               # 登录注册页（无需登录）
/
├─ /home              # 首页仪表盘
├─ /course            # 课程预约
├─ /my-booking        # 我的订单
├─ /wallet            # 我的钱包
├─ /pay/success       # 支付成功回调
├─ /admin-course      # 课程管理（仅管理员）
└─ /admin-user        # 用户管理（仅管理员）
```

### 页面详情

#### 登录页 (`/login`)

- 用户登录：调用 `/auth/login` 接口，成功后保存 Token 和用户信息到 localStorage
- 用户注册：调用 `/auth/register` 接口，注册后需手动登录
- 渐变紫色背景 + 卡片居中布局

#### 首页仪表盘 (`/home`)

- 数据卡片：总营收、总用户数、订单总量、AI 咨询热度
- ECharts 饼图：会员等级分布（后端真实数据）
- ECharts 折线图：近七日营收趋势（模拟数据）
- 数据来源：调用 `/report/dashboard` 接口

#### 课程预约 (`/course`)

- 展示所有课程列表（名称、教练、时间、价格、剩余名额）
- 抢课按钮：调用 `/booking/create`，后端分布式锁保护
- 课程过期/售罄自动禁用
- 抢课成功后弹窗引导去支付

#### 我的订单 (`/my-booking`)

- 展示当前用户的所有预约记录
- 待支付订单：支持余额支付、支付宝支付、取消
- 已支付订单：支持取消（退款+回库存）
- 支付宝支付跳转：`window.location.href` 跳转到支付宝沙箱页面

#### 我的钱包 (`/wallet`)

- 用户档案：用户名、VIP 标签、到期时间（临近过期标红提醒）
- 余额展示：大字体金额 + 支付宝充值按钮
- 充值弹窗：输入金额 → 跳转支付宝沙箱 → 支付回调刷新余额
- VIP 专区：月卡（30元/9折）、年卡（300元/8折），支持续期

#### 支付成功页 (`/pay/success`)

- 支付宝支付成功后跳转此页面
- 调用 `/alipay/return` 同步订单状态
- 显示支付结果（成功/失败/处理中）
- 提供返回首页和查看订单的快捷入口

#### 管理员-课程管理 (`/admin-course`)

- 课程列表（ID、名称、教练、时间、价格、库存）
- 新增按钮：弹窗表单（名称、教练、简介、时间、价格、库存）
- 编辑/删除操作

#### 管理员-用户管理 (`/admin-user`)

- 用户列表（ID、用户名、角色、余额、VIP等级、到期时间、注册时间）
- 按用户名搜索过滤
- 编辑用户：可修改角色、余额、会员等级
- 删除用户（带二次确认）

### 主布局 (`Layout.vue`)

- 左侧深色侧边栏：Logo + 菜单导航（首页/课程/订单/钱包/系统管理）
- 顶部导航栏：管理员标识 / 用户欢迎语 + 头像下拉菜单（个人中心/退出登录）
- 主内容区：`<router-view>` 带页面切换动画
- 底部悬浮 AI 聊天组件

## AI 聊天组件

[AiChat.vue](file:///d:/Workspace/code-test/Gym/gym-vue/src/components/AiChat.vue) 是一个悬浮在页面右下角的智能对话组件：

- **悬浮球**：紫色渐变 + 呼吸灯动画
- **聊天窗口**：360×520px，带消息列表和输入框
- **打字机效果**：AI 回复逐字输出
- **加载状态**：三点跳动动画
- **对话能力**：支持课程推荐、余额查询、VIP 权益咨询
- **后端对接**：调用 `/ai/chat` 接口，传入 `userId` 和 `message`

## 路由守卫

[router/index.js](file:///d:/Workspace/code-test/Gym/gym-vue/src/router/index.js) 中的路由守卫逻辑：

1. **白名单**：`/login` 直接放行
2. **登录检查**：未登录用户重定向到 `/login`
3. **权限拦截**：非 admin 角色访问 `/admin-*` 路由时，提示无权限并强制跳转首页

## HTTP 请求封装

[utils/request.js](file:///d:/Workspace/code-test/Gym/gym-vue/src/utils/request.js)：

- **baseURL**：`http://localhost:8080`（后端地址）
- **请求拦截器**：自动附加 `Authorization` Token
- **响应拦截器**：
  - 统一判断 `res.code`，非 200 自动弹错误提示
  - 401 状态码自动清除登录状态

## 启动方式

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 构建生产版本
npm run build
```

> 注意：启动前端前请确保后端服务 `http://localhost:8080` 已正常运行。