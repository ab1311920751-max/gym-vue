# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

健身房课程预约系统的前端（Vue 3 + Vite + Element Plus），毕业设计项目。后端 Spring Boot 服务运行在 `http://localhost:8080`。

数据库 schema 在 [db_backups/gym_db4.sql](db_backups/gym_db4.sql)（MySQL，schema `gym_db`），但部分 SQL 注释陈旧。完整后端接口文档见 [API.md](API.md)，是权威参考。

## 常用命令

```bash
npm install        # 安装依赖
npm run dev        # 启动开发服务器（Vite，默认 5173）
npm run build      # 生产构建 → dist/
npm run preview    # 预览构建产物
```

仓库没有配置 lint、test、type-check。

## 架构要点

### 后端契约

所有业务接口走 [src/utils/request.js](src/utils/request.js) 的 axios 实例：

- **baseURL 硬编码**为 `http://localhost:8080`。
- **Header key 是 `token`**（小写），不带 `Bearer ` 前缀（[request.js:12](src/utils/request.js#L12)）。
- **响应约定**：`{ code, msg, data }`，`code` 是字符串（`'200'`/`'401'`）。拦截器自动处理 `401`（清 localStorage 跳 `/login`）和其它错误（`ElMessage.error` 后 reject），业务代码通常无需再处理错误提示。

### 鉴权与路由

- 登录接口 `POST /auth/login` 返回 `data` 为 JWT 字符串。Login.vue 存储 token 后立即调用 `GET /user/me` 获取完整用户对象，一并写入 localStorage。
- localStorage 两个 key：`token`（JWT 字符串）和 `user`（JSON 对象，含 `id`/`role`/`username`/`balance`/`vipType`/`vipExpireTime` 等字段）。
- 路由守卫：未登录踢回 `/login`；非 admin 访问 `/admin-*` 提示无权限并跳 `/home`。
- 角色常量见 [src/constants/role.js](src/constants/role.js)。

### 页面结构

[Layout.vue](src/views/Layout.vue) 是壳（左侧 `el-menu` + 顶部用户菜单）。

用户端：
- [Home.vue](src/views/Home.vue) —— 运营驾驶舱，调 `GET /report/console`
- [Course.vue](src/views/Course.vue) —— 课程列表 + 抢课，调 `POST /booking`
- [CourseDetail.vue](src/views/CourseDetail.vue) —— 课程详情、评价、收藏
- [CoachList.vue](src/views/CoachList.vue) —— 教练列表，调 `GET /coach/list`
- [Cart.vue](src/views/Cart.vue) —— 购物车 + 批量结算 `POST /cart/checkout`
- [MyBooking.vue](src/views/MyBooking.vue) —— 订单列表（按状态分 tab），支付宝支付
- [Wallet.vue](src/views/Wallet.vue) —— 余额/充值/购买 VIP/充值记录
- [Favorites.vue](src/views/Favorites.vue) —— 我的收藏
- [AiChat.vue](src/views/AiChat.vue) —— AI 健身助手（多轮对话），调 `POST /ai/chat`
- [PaySuccess.vue](src/views/PaySuccess.vue) —— 支付宝同步回跳页

管理端（仅 admin）：
- [AdminUser.vue](src/views/AdminUser.vue) / [AdminCourse.vue](src/views/AdminCourse.vue) —— 用户/课程 CRUD + 分页
- [AdminBooking.vue](src/views/AdminBooking.vue) —— 订单管理，调 `GET /booking/admin/list`
- [AdminCoach.vue](src/views/AdminCoach.vue) —— 教练管理，调 `/coach` CRUD
- [AdminKnowledge.vue](src/views/AdminKnowledge.vue) —— AI 知识库，调 `/ai/knowledge` CRUD

### API 模块

[src/api/](src/api/) 按域名拆分：`auth`/`booking`/`course`/`user`/`alipay`/`report`/`coach`/`cart`/`favorite`/`review`/`ai`。新增接口放对应文件。

### 业务常量

- [src/constants/booking.js](src/constants/booking.js)：`PENDING=0/PAID=1/CANCELLED=2`（待支付/已预约/已取消），以 JS 为准，SQL 注释陈旧。
- [src/constants/vip.js](src/constants/vip.js)：月卡 30 元/9 折，年卡 300 元/8 折。
- `LOW_STOCK_THRESHOLD = 3` 控制红色库存提示。

### 主题色

全站橙色 `#ff7a2f`，定义在两处，改色同步：
- [src/styles/theme.css](src/styles/theme.css) —— Element Plus CSS 变量
- [src/constants/theme.js](src/constants/theme.js) —— JS 侧（ECharts 配色等）

### Coze AI vs 后端 AI

- [index.html](index.html#L9-L54)：通过 CDN 引入 `CozeWebSDK`，右下角悬浮按钮，与 Vue 完全解耦。
- [AiChat.vue](src/views/AiChat.vue)：基于后端 `/ai/chat` 的 Vue 组件内 AI 对话。两者独立。

### 支付宝流程

1. `buildPayUrl({ bookingNo })` 或 `buildPayUrl({ traceNo, totalAmount })` 拼出 URL。
2. 跳转到后端 `/alipay/pay`，后端返回支付宝表单自动 submit。
3. 支付完成 302 → `/pay/success`，PaySuccess.vue 调 `GET /alipay/return` 确认。
