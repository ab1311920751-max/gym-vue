export const API = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  USER: {
    LIST: '/user/list',
    DETAIL: (id) => `/user/${id}`,
    PAGE: '/user/page',
    SAVE: '/user',
    UPDATE: '/user',
    DELETE: (id) => `/user/${id}`,
    RECHARGE: '/user/recharge',
    BUY_VIP: '/user/buyVip',
  },
  COURSE: {
    LIST: '/course/list',
    DETAIL: (id) => `/course/${id}`,
    PAGE: '/course/page',
    SAVE: '/course',
    UPDATE: '/course',
    DELETE: (id) => `/course/${id}`,
  },
  BOOKING: {
    CREATE: '/booking/create',
    MY: '/booking/my',
    CANCEL: (id) => `/booking/cancel/${id}`,
    PAY: (id) => `/booking/pay/${id}`,
  },
  ALIPAY: {
    PAY: '/alipay/pay',
    RETURN: '/alipay/return',
    SUCCESS: '/alipay/success',
  },
  REPORT: {
    DASHBOARD: '/report/dashboard',
  },
  AI: {
    CHAT: '/ai/chat',
  },
}

export const BOOKING_STATUS = {
  PENDING: 0,
  PAID: 1,
  CANCELLED: 2,
}

export const VIP_TYPE = {
  NORMAL: 0,
  MONTHLY: 1,
  YEARLY: 2,
}
