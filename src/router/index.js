import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../views/Layout.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/Home.vue')
      },
      {
        path: 'course',
        name: 'Course',
        component: () => import('../views/Course.vue')
      },
      {
        path: 'my-booking',
        name: 'MyBooking',
        component: () => import('../views/MyBooking.vue')
      },
      // --- 新增管理路由 ---
      {
        path: 'admin-course',
        name: 'AdminCourse',
        component: () => import('../views/AdminCourse.vue')
      },
      {
        path: 'admin-user',
        name: 'AdminUser',
        component: () => import('../views/AdminUser.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 简单的路由守卫
router.beforeEach((to, from, next) => {
  const user = localStorage.getItem('user')
  // 如果去非登录页且没有用户信息，跳转登录
  if (to.path !== '/login' && !user) {
    next('/login')
  } else {
    next()
  }
})

export default router