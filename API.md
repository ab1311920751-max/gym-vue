# 智能健身预约系统 — 后端接口文档

> 基准地址：`http://localhost:8080`
> 前端端口：`5173`
> 所有需要登录的接口，前端在 Header 携带 `token: <JWT>`（登录成功返回值）。

---

## 通用约定

### 响应格式

每个接口统一返回以下 JSON 结构：

```json
{
  "code": "200",
  "msg": "success",
  "data": { }
}
```

| code | 含义 |
|------|------|
| 200 | 成功 |
| 400x | 用户/密码类错误 |
| 410x | 课程/预约类错误 |
| 44xx | 支付宝类错误 |
| 450x | AI 类错误 |
| 460x | 教练/评价/收藏类错误 |
| 500 | 系统异常（GlobalExceptionHandler 兜底） |

### Header 传递

前端对所有 **需要登录** 的接口统一在 Header 里带：

```
token: <登录时返回的 JWT 字符串>
```

白名单接口（不需要 token）：
- `POST /auth/login`
- `POST /auth/register`
- `GET /alipay/pay` / `GET /alipay/return` / `POST /alipay/notify`
- `GET /error`

---

## 一、认证模块 — `/auth`

### 1.1 登录

```
POST /auth/login
```

**请求体**

```json
{
  "username": "admin",
  "password": "123456"
}
```

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": "eyJhbGciOiJIUzI1NiJ9..."
}
```

`data` 就是 JWT 字符串，前端存到 localStorage/sessionStorage，后续请求 Header 里带 `token: <该值>`。

---

### 1.2 注册

```
POST /auth/register
```

**请求体**

```json
{
  "username": "newuser",
  "password": "123456",
  "nickname": "新用户",
  "phone": "13800138000",
  "email": "test@example.com",
  "gender": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | String | 是 | 用户名 |
| password | String | 是 | 登录密码（明文，服务端 BCrypt 哈希存储） |
| nickname | String | 否 | 昵称 |
| phone | String | 否 | 手机号 |
| email | String | 否 | 邮箱 |
| gender | Integer | 否 | 性别 0=未知 1=男 2=女 |

> **注意**：`role`、`balance`、`vipType` 由后端强制赋值（user / 0 / 0），前端传了也无效。

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": null
}
```

---

## 二、用户模块 — `/user`

### 2.1 查看个人信息

```
GET /user/me
```

> **需登录**。用户 ID 从 JWT 解析，不需要传参。

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "balance": 500.00,
    "vipType": 2,
    "vipExpireTime": "2026-12-31T23:59:59",
    "nickname": "管理员",
    "phone": "13800001111",
    "email": "admin@gym.com",
    "avatar": null,
    "gender": 1,
    "birthday": "1999-01-01",
    "height": 178.00,
    "weight": 72.50,
    "fitnessGoal": "增肌",
    "trainingYears": 2,
    "createTime": "2026-01-01T10:00:00"
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 用户 ID |
| username | String | 用户名 |
| role | String | 角色：admin / user |
| balance | BigDecimal | 账户余额 |
| vipType | Integer | 0=普通 1=月卡 2=年卡 |
| vipExpireTime | String(LocalDateTime) | VIP 到期时间 |
| nickname | String | 昵称 |
| phone | String | 手机号 |
| email | String | 邮箱 |
| avatar | String | 头像 URL |
| gender | Integer | 0=未知 1=男 2=女 |
| birthday | String(LocalDate) | 生日 yyyy-MM-dd |
| height | BigDecimal | 身高 cm |
| weight | BigDecimal | 体重 kg |
| fitnessGoal | String | 健身目标：减脂/增肌/塑形/康复 |
| trainingYears | Integer | 训练年限 |

---

### 2.2 修改个人资料

```
PUT /user/profile
```

> **需登录**。用户 ID 从 JWT 解析。

**请求体**

```json
{
  "nickname": "新昵称",
  "phone": "13800000000",
  "email": "new@gym.com",
  "avatar": null,
  "gender": 1,
  "birthday": "2000-05-18",
  "height": 175.00,
  "weight": 68.00,
  "fitnessGoal": "减脂",
  "trainingYears": 1
}
```

全部字段可选，只传要改的字段即可。

> **安全约束**：不能通过此接口改 `username` / `role` / `balance` / `vipType` / `vipExpireTime`，这些字段 DTO 里没有。

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": null
}
```

---

### 2.3 修改密码

```
PUT /user/password
```

> **需登录**。

**请求体**

```json
{
  "oldPassword": "123456",
  "newPassword": "654321"
}
```

| 规则 | 说明 |
|------|------|
| oldPassword 必须与当前密码一致 | 否则返回 `code: "4004"`（旧密码错误） |
| newPassword 长度 6-32 位 | 否则返回 `code: "4005"`（新密码无效） |

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": null
}
```

---

## 三、课程模块 — `/course`

### 3.1 课程列表

```
GET /course/list
```

> 不需要登录也能访问（如需加 JWT 保护，后端改 WebMvcConfig 白名单即可）。

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": [
    {
      "id": 1,
      "name": "动感单车",
      "coach": "王教练",
      "content": "高强度燃脂课程",
      "startTime": "2026-05-20T09:00:00",
      "endTime": "2026-05-20T10:00:00",
      "price": 88.00,
      "stock": 15,
      "coachId": 1,
      "categoryId": 1
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 课程 ID |
| name | String | 课程名称 |
| coach | String | 教练姓名（兼容旧数据；有 coachId 时前端优先用教练表数据） |
| coachId | Long | 教练 ID（阶段 3 新增） |
| categoryId | Long | 课程分类 ID（阶段 3 新增） |
| content | String | 课程描述 |
| startTime | String(LocalDateTime) | 开始时间 |
| endTime | String(LocalDateTime) | 结束时间 |
| price | BigDecimal | 原价 |
| stock | Integer | 剩余名额 |

---

### 3.2 课程详情

```
GET /course/{id}
```

例如：`GET /course/1`

**响应**：与列表中的单条结构一致。

---

### 3.3 课程分类列表

```
GET /course/category
```

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": [
    { "id": 1, "name": "有氧燃脂", "icon": "🔥", "sortOrder": 1 },
    { "id": 2, "name": "搏击体能", "icon": "🥊", "sortOrder": 2 },
    { "id": 3, "name": "瑜伽冥想", "icon": "🧘", "sortOrder": 3 },
    { "id": 4, "name": "力量训练", "icon": "🏋️", "sortOrder": 4 },
    { "id": 5, "name": "水上运动", "icon": "🏊", "sortOrder": 5 }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 分类 ID |
| name | String | 分类名称 |
| icon | String | 图标（emoji 或 CSS class，前端自行渲染） |
| sortOrder | Integer | 排序，越小越靠前 |

---

## 四、教练模块 — `/coach`

### 4.1 教练列表

```
GET /coach/list
```

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": [
    {
      "id": 1,
      "name": "王教练",
      "intro": "十年健身教练经验，擅长减脂与体能训练",
      "avatar": null,
      "specialty": "减脂,体能,动感单车",
      "avgRating": 4.50,
      "createTime": "2026-05-01T10:00:00"
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 教练 ID |
| name | String | 姓名 |
| intro | String | 简介 |
| avatar | String | 头像 URL |
| specialty | String | 擅长领域（逗号分隔） |
| avgRating | BigDecimal | 平均评分（从所有课程评价自动计算，保留一位小数） |

---

### 4.2 教练详情

```
GET /coach/{id}
```

**响应**：同上单条结构。

---

### 4.3 新增教练（管理端）

```
POST /coach
```

**请求体**

```json
{
  "name": "陈教练",
  "intro": "前国家队体能教练",
  "avatar": null,
  "specialty": "力量训练,运动康复"
}
```

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": 6
}
```

`data` 为新创建的教练 ID。

---

### 4.4 修改教练（管理端）

```
PUT /coach/{id}
```

**请求体**：同新增，全部可选，只传要改的字段。

---

### 4.5 删除教练（管理端）

```
DELETE /coach/{id}
```

---

## 五、预约模块 — `/booking`

### 5.1 下单预约

```
POST /booking
```

**请求体**

```json
{
  "userId": 2,
  "courseId": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | Long | 是 | 预约用户 ID |
| courseId | Long | 是 | 课程 ID |

> 后端校验：课程存在 + 库存 > 0 + 未过期 + 用户未重复预约 + 同时间段无冲突。下单即扣库存。

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": 10
}
```

`data` 是订单 ID（course_booking 表的主键）。

---

### 5.2 取消预约

```
POST /booking/cancel/{bookingId}
```

例如：`POST /booking/cancel/10`

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": null
}
```

> 状态为 PENDING 或 PAID 的订单均可取消，取消后库存 +1。

---

### 5.3 我的预约

```
GET /booking/my
```

> 用户 ID 从 JWT 解析（后端 `BookingMapper.selectMyBookings` 走 `@CurrentUserId`）。

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": [
    {
      "id": 10,
      "status": 0,
      "bookingTime": "2026-05-18T14:30:00",
      "courseName": "动感单车",
      "coach": "王教练",
      "startTime": "2026-05-20T09:00:00",
      "price": 88.00
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 预约 ID |
| status | Integer | 0=待支付(PENDING), 1=已支付(PAID), 2=已取消(CANCELLED) |
| bookingTime | String | 下单时间 |
| courseName | String | 课程名称 |
| coach | String | 教练名（优先教练表，兼容旧数据） |
| startTime | String | 上课时间 |
| price | BigDecimal | 实付价格（已扣 VIP 折扣） |

---

### 5.4 所有预约列表（管理端）

```
GET /booking/admin/list
```

**响应**：同上 `List<BookingVO>`。

---

## 六、购物车模块 — `/cart`

### 6.1 查看购物车

```
GET /cart
```

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": [
    {
      "id": 1,
      "courseId": 2,
      "courseName": "瑜伽基础",
      "coach": "李教练",
      "startTime": "2026-05-21T10:00:00",
      "price": 68.00,
      "addTime": "2026-05-18T13:00:00"
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 购物车条目 ID |
| courseId | Long | 课程 ID |
| courseName | String | 课程名 |
| coach | String | 教练 |
| startTime | String | 上课时间 |
| price | BigDecimal | 价格 |
| addTime | String | 加入时间 |

---

### 6.2 加入购物车

```
POST /cart/{courseId}
```

例如：`POST /cart/2`

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": null
}
```

---

### 6.3 删除购物车条目

```
DELETE /cart/{id}
```

`id` 是购物车条目 ID，不是课程 ID。

---

### 6.4 批量结算

```
POST /cart/checkout
```

无需传参，后端取当前用户购物车所有条目，逐一生成 booking。

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": [
    { "bookingId": 11, "courseName": "瑜伽基础", "status": 0 },
    { "bookingId": 12, "courseName": "搏击操",   "status": 0 }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| bookingId | Long | 生成的订单 ID |
| courseName | String | 课程名 |
| status | Integer | 订单状态（刚生成时均为 0-PENDING） |

> 结算成功后购物车已下单条目会被清除。

---

## 七、支付模块 — `/alipay`

### 7.1 拉起支付宝支付

```
GET /alipay/pay
```

两种调用方式：

**方式一：预约支付**

```
GET /alipay/pay?bookingNo=<订单ID>
```

后端生成支付宝支付表单（自动跳转），支付成功后会异步回调 `bookingService.paySuccess`，同步回跳 `alipay.return-url`（配置为 `http://localhost:5173/my-bookings`）。

**方式二：余额充值**

```
GET /alipay/pay?traceNo=<充值流水号>&totalAmount=<充值金额>
```

同步回跳 `http://localhost:5173/wallet?pay=success`。

> `traceNo` 由前端生成（如 `RECHARGE_<timestamp>_<random>`），`totalAmount` 为充值金额（元）。

---

### 7.2 支付宝同步回调

```
GET /alipay/return
```

支付宝支付完成后浏览器同步跳回，不需要前端处理（页面会自动跳转到 return-url）。

---

### 7.3 支付宝异步通知

```
POST /alipay/notify
```

支付宝服务端异步回调，前端不需要处理。

---

### 7.4 确认充值到账

```
POST /alipay/success
```

> **需登录**。用户 ID 从 JWT 解析，不能信前端传值（防止给他人充值）。

**请求体**

```json
{
  "traceNo": "RECHARGE_20260518_143000_abc123",
  "totalAmount": "100.00"
}
```

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": null
}
```

> 前端在用户从支付宝页面跳回钱包页时调用此接口确认余额增加。

---

### 7.5 充值记录

```
GET /alipay/recharge-records
```

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": [
    {
      "id": 1,
      "userId": 2,
      "amount": 100.00,
      "traceNo": "RECHARGE_20260518_143000_abc123",
      "createTime": "2026-05-18T14:30:00"
    }
  ]
}
```

---

## 八、评价模块

### 8.1 发表评价

```
POST /course/{courseId}/review
```

**请求体**

```json
{
  "rating": 5,
  "content": "王教练讲得非常细致，强度也刚好！"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| rating | Integer | 是 | 评分 1-5（后端校验 @Min(1) @Max(5)） |
| content | String | 否 | 评论文字 |

> 每用户每课程限评一次，重复评价返回 `code: "4603"`。

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": 1
}
```

`data` 为评价 ID。

---

### 8.2 查看课程评价

```
GET /course/{courseId}/reviews
```

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": [
    {
      "id": 1,
      "courseId": 1,
      "userId": 2,
      "username": "zhangsan",
      "rating": 5,
      "content": "王教练讲得非常细致！",
      "createTime": "2026-05-18T15:00:00"
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 评价 ID |
| courseId | Long | 课程 ID |
| userId | Long | 评价用户 ID |
| username | String | 评价用户名 |
| rating | Integer | 评分 1-5 |
| content | String | 评论内容 |
| createTime | String | 评价时间 |

---

## 九、收藏模块 — `/favorite`

### 9.1 收藏课程

```
POST /favorite/{courseId}
```

例如：`POST /favorite/1`

> 每用户每课程限收藏一次，重复收藏返回 `code: "4605"`。

---

### 9.2 取消收藏

```
DELETE /favorite/{courseId}
```

> 收藏不存在返回 `code: "4606"`。

---

### 9.3 我的收藏

```
GET /favorite/my
```

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": [
    {
      "id": 1,
      "courseId": 1,
      "courseName": "动感单车",
      "coachName": "王教练",
      "price": 88.00,
      "startTime": "2026-05-20T09:00:00",
      "createTime": "2026-05-18T13:00:00"
    }
  ]
}
```

---

## 十、AI 助手模块

### 10.1 发送消息 / 新建对话

```
POST /ai/chat
```

> **需登录**。支持多轮对话：不传 sessionId 则自动创建新会话，传了则续聊。

**请求体**

```json
{
  "sessionId": null,
  "message": "给我推荐几节减脂课"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sessionId | Long | 否 | 会话 ID；为空/null 时新建会话 |
| message | String | 是 | 用户消息（不能为空） |

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": {
    "sessionId": 1,
    "reply": "根据您的身体状况（72kg，目标减脂），为您推荐以下课程：\n..."
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| sessionId | Long | 会话 ID（新建时后端返回，前端请保存用于后续续聊） |
| reply | String | AI 回复内容 |

---

### 10.2 我的会话列表

```
GET /ai/session/my
```

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": [
    {
      "id": 1,
      "title": "给我推荐几节减脂课",
      "createTime": "2026-05-18T14:00:00",
      "updateTime": "2026-05-18T14:00:05"
    }
  ]
}
```

| 字段 | 说明 |
|------|------|
| id | 会话 ID |
| title | 会话标题（取首条消息前 20 字） |
| updateTime | 最近活跃时间，按此倒序排列 |

---

### 10.3 会话消息历史

```
GET /ai/session/{sessionId}/messages
```

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": [
    {
      "id": 1,
      "role": "user",
      "content": "给我推荐几节减脂课",
      "createTime": "2026-05-18T14:00:00"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "根据您的身体状况...",
      "createTime": "2026-05-18T14:00:05"
    }
  ]
}
```

| 字段 | 说明 |
|------|------|
| role | user / assistant |
| content | 消息内容 |
| createTime | 发送时间 |

---

### 10.4 删除会话

```
DELETE /ai/session/{sessionId}
```

> 逻辑删除（`is_deleted = 1`），对应会话和消息不会被物理删除。

---

### 10.5 知识库列表（管理端）

```
GET /ai/knowledge/list
```

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": [
    {
      "id": 1,
      "category": "训练动作",
      "keywords": "深蹲,下肢,臀腿,力量",
      "question": "深蹲时膝盖疼是什么原因？",
      "answer": "膝盖疼常见于动作不规范：膝盖过度内扣、身体过度前倾、使用过重的重量。建议先做自重深蹲纠正发力模式，保持膝盖与脚尖方向一致，下蹲深度量力而行。",
      "createTime": "2026-05-01T10:00:00",
      "updateTime": "2026-05-01T10:00:00"
    }
  ]
}
```

---

### 10.6 新增知识条目（管理端）

```
POST /ai/knowledge
```

```json
{
  "category": "饮食",
  "keywords": "蛋白质,增肌,饮食",
  "question": "增肌期每天需要摄入多少蛋白质？",
  "answer": "一般建议每公斤体重摄入 1.6-2.2 克蛋白质。以 70 公斤为例，建议日摄入 112-154 克，可分 3-4 餐均匀摄入。"
}
```

---

### 10.7 修改知识条目（管理端）

```
PUT /ai/knowledge/{id}
```

请求体同新增。

---

### 10.8 删除知识条目（管理端）

```
DELETE /ai/knowledge/{id}
```

---

## 十一、报表模块 — `/report`

### 11.1 管理端控制台数据

```
GET /report/console
```

**响应**

```json
{
  "code": "200",
  "msg": "success",
  "data": {
    "userCount": 128,
    "courseCount": 35,
    "bookingCount": 512,
    "totalRevenue": 35680.00
  }
}
```

| 字段 | 说明 |
|------|------|
| userCount | 注册用户总数 |
| courseCount | 课程总数 |
| bookingCount | 预约订单总数 |
| totalRevenue | 总营收（元） |

---

## 附 A：前端页面 → 后端接口对照速查表

| 前端页面 / 组件 | 用到的接口 |
|----------------|-----------|
| 登录页 | `POST /auth/login` |
| 注册页 | `POST /auth/register` |
| 个人中心 | `GET /user/me` + `PUT /user/profile` + `PUT /user/password` |
| 首页 / 课程列表 | `GET /course/list` + `GET /course/category` |
| 课程详情 | `GET /course/{id}` + `GET /course/{id}/reviews` + `POST /course/{id}/review` + `POST /favorite/{courseId}` |
| 教练列表 | `GET /coach/list` |
| 教练详情 | `GET /coach/{id}` |
| 购物车 | `GET /cart` + `POST /cart/{courseId}` + `DELETE /cart/{id}` + `POST /cart/checkout` |
| 我的预约 | `GET /booking/my` + `POST /booking/cancel/{bookingId}` |
| 课程预约（直接购买）| `POST /booking` |
| 支付（拉起支付宝）| `GET /alipay/pay?bookingNo=...` 或 `?traceNo=...&totalAmount=...` |
| 钱包 / 充值确认 | `POST /alipay/success` + `GET /alipay/recharge-records` |
| 我的收藏 | `GET /favorite/my` + `DELETE /favorite/{courseId}` |
| AI 助手对话 | `POST /ai/chat` + `GET /ai/session/my` + `GET /ai/session/{id}/messages` + `DELETE /ai/session/{id}` |
| 管理后台 — 仪表盘 | `GET /report/console` |
| 管理后台 — 订单管理 | `GET /booking/admin/list` |
| 管理后台 — 教练管理 | `GET/POST/PUT/DELETE /coach` |
| 管理后台 — 知识库管理 | `GET/POST/PUT/DELETE /ai/knowledge` |

## 附 B：Vue 3 Axios 封装参考

```typescript
// src/utils/http.ts
import axios from 'axios';

const http = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
});

// 请求拦截器：自动带 JWT
http.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.token = token;
  }
  return config;
});

// 响应拦截器：统一处理 code !== 200
http.interceptors.response.use(
  res => {
    if (res.data.code !== '200') {
      ElMessage.error(res.data.msg || '请求失败');
      return Promise.reject(res.data);
    }
    return res.data;  // 业务层直接拿到 Result 对象
  },
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      router.push('/login');
    }
    return Promise.reject(err);
  }
);

export default http;
```

使用示例：

```typescript
import http from '@/utils/http';

// 登录
const res = await http.post('/auth/login', { username: 'admin', password: '123456' });
const token = res.data;  // JWT 字符串
localStorage.setItem('token', token);

// 获取课程列表
const res = await http.get('/course/list');
const courses = res.data;  // GymCourse[]
```
