import request from '../utils/request'
import { API } from '../constants'

export const authApi = {
  login: (data) => request.post(API.AUTH.LOGIN, data),
  register: (data) => request.post(API.AUTH.REGISTER, data),
}

export const userApi = {
  list: () => request.get(API.USER.LIST),
  detail: (id) => request.get(API.USER.DETAIL(id)),
  page: (params) => request.get(API.USER.PAGE, { params }),
  save: (data) => request.post(API.USER.SAVE, data),
  update: (data) => request.put(API.USER.UPDATE, data),
  delete: (id) => request.delete(API.USER.DELETE(id)),
  recharge: (data) => request.post(API.USER.RECHARGE, data),
  buyVip: (data) => request.post(API.USER.BUY_VIP, data),
}

export const courseApi = {
  list: () => request.get(API.COURSE.LIST),
  detail: (id) => request.get(API.COURSE.DETAIL(id)),
  page: (params) => request.get(API.COURSE.PAGE, { params }),
  save: (data) => request.post(API.COURSE.SAVE, data),
  update: (data) => request.put(API.COURSE.UPDATE, data),
  delete: (id) => request.delete(API.COURSE.DELETE(id)),
}

export const bookingApi = {
  create: (data) => request.post(API.BOOKING.CREATE, data),
  my: (params) => request.get(API.BOOKING.MY, { params }),
  cancel: (id) => request.post(API.BOOKING.CANCEL(id)),
  pay: (id) => request.post(API.BOOKING.PAY(id)),
}

export const reportApi = {
  dashboard: () => request.get(API.REPORT.DASHBOARD),
}

export const aiApi = {
  chat: (data) => request.post(API.AI.CHAT, data),
}
