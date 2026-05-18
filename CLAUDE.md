# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

健身房课程预约系统的前端（Vue 3 + Vite + Element Plus），毕业设计项目。后端是独立的 Spring Boot 服务，运行在 `http://localhost:8080`（见 [src/utils/request.js](src/utils/request.js#L5)），开发时必须先启动后端，否则所有接口都会 404 / 网络异常。

数据库 schema 与示例数据在 [db_backups/gym_db4.sql](db_backups/gym_db4.sql)（MySQL，schema 名 `gym_db`），可作为后端字段的参考。

## 常用命令

```bash
npm install        # 安装依赖
npm run dev        # 启动开发服务器（Vite，默认 5173）
npm run build      # 生产构建 → dist/
npm run preview    # 预览构建产物
```

仓库没有配置 lint、test、type-check —— 不要假设这些命令存在。

## 架构要点

### 后端契约（贯穿整个前端）

所有业务接口走 [src/utils/request.js](src/utils/request.js) 的 axios 实例：

- **baseURL 硬编码**为 `http://localhost:8080`（[request.js:5](src/utils/request.js#L5)），切环境时需要改这里。
- **Token 直接放在 `Authorization` 头**，没有 `Bearer ` 前缀（[request.js:12](src/utils/request.js#L12)）。
- **响应约定**：`{ code, msg, data }`，**`code` 是字符串**（`'200'` / `'401'`），不是 number。拦截器只把 `'200'` 当成功；`'401'` 自动清 localStorage 并跳 `/login`；其它 code 直接 `ElMessage.error(res.msg)` 后 reject。业务代码通常无需再处理错误提示。

### 鉴权与路由

- 登录态完全靠 `localStorage`：`token`（字符串）和 `user`（JSON.stringify 后的用户对象，含 `role` / `username` / `balance` / `vipType` / `vipExpireTime`）。两者由 [Login.vue](src/views/Login.vue) 写入。
- 路由守卫在 [src/router/index.js:35](src/router/index.js#L35)：未登录踢回 `/login`；普通用户访问 `/admin-*` 会被 `ElMessage.error` 并强制跳回 `/home`。
- 角色判断用 `user.role === 'admin'`，常量见 [src/constants/role.js](src/constants/role.js)。

### 页面结构

[Layout.vue](src/views/Layout.vue) 是壳（左侧 `el-menu` + 顶部用户菜单），所有业务页面是它的子路由；`/login` 和 `/pay/success` 走自己的路径但 PaySuccess 也挂在 Layout 下（注意 [router/index.js:16-20](src/router/index.js#L16-L20) 用了绝对路径 `/pay/success` 作为 children，这是有意的写法）。

业务页面职责：
- [Home.vue](src/views/Home.vue) —— 运营驾驶舱，调 `/report/dashboard`，用 ECharts 画饼图
- [Course.vue](src/views/Course.vue) —— 课程列表 + 抢课（调用 `/booking/create`，后端用 Redisson 锁防超卖，见 git 历史）
- [MyBooking.vue](src/views/MyBooking.vue) —— 订单列表，按状态分 tab
- [Wallet.vue](src/views/Wallet.vue) —— 余额 / 充值 / 购买 VIP
- [PaySuccess.vue](src/views/PaySuccess.vue) —— 支付宝同步回跳页，从 query 取 `out_trade_no` / `trade_no` 再调 `/alipay/return` 让后端确认
- [AdminCourse.vue](src/views/AdminCourse.vue) / [AdminUser.vue](src/views/AdminUser.vue) —— 仅 admin 可见，CRUD + 分页

API 调用按域名拆到 [src/api/](src/api/) 下（`auth` / `booking` / `course` / `user` / `alipay` / `report`），新增接口请放对应文件，不要直接在视图里写 axios。

### 业务常量（容易踩坑）

- [src/constants/booking.js](src/constants/booking.js) 定义 `PENDING=0 / PAID=1 / CANCELLED=2`，但数据库 SQL 注释写的是 `0-已预约, 1-已取消, 2-已签到`。**以前端常量为准**（后端真实语义就是「待支付 / 已预约 / 已取消」，SQL 注释陈旧），改后端字段含义时要同步两边。
- [src/constants/vip.js](src/constants/vip.js) —— VIP 等级 / 价格 / 折扣文案；月卡 30 元 / 9 折，年卡 300 元 / 8 折。
- `LOW_STOCK_THRESHOLD = 3` 控制「仅剩 N 位」红色提示阈值。

### 主题色

全站使用橙色主题 `#ff7a2f`。主题色统一定义在两处，**改色要同步改**：
- [src/styles/theme.css](src/styles/theme.css) —— 覆盖 Element Plus CSS 变量
- [src/constants/theme.js](src/constants/theme.js) —— JS 侧（ECharts 配色、内联样式）

最近一次大改就是「全站橙色主题与接口对齐重构」（见 `git log`），新写组件请直接用 `--el-color-primary` 或 `PRIMARY` 常量，不要再硬编码颜色。

### Coze AI 聊天助手

[index.html](index.html#L9-L54) 通过 CDN 引入 `CozeWebSDK` 并在 `window.load` 后初始化，**与 Vue 应用完全解耦**，是页面右下角悬浮按钮形态。`bot_id` 和 PAT `token` 直接写在 HTML 里（毕设演示用，生产不能这么暴露）。它不在 Vue 路由 / 组件树内，调整 UI 时别去 src 里找。

### 支付宝流程

1. 前端用 [src/api/alipay.js](src/api/alipay.js) 的 `buildPayUrl` 拼出后端 `/alipay/pay` 的 GET URL（带 `bookingNo` / `totalAmount` / `subject`）。
2. 跳转到该 URL，后端返回支付宝表单 HTML 并自动 submit 到支付宝。
3. 支付完成后支付宝 302 回 `/pay/success?out_trade_no=...&trade_no=...`，PaySuccess.vue 再调 `/alipay/return` 让后端校验签名 + 改订单状态。

充值场景额外有 `/alipay/success` 回调（见 `confirmRecharge`）。
