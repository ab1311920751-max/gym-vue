import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../views/Layout.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      { path: 'home', name: 'Home', component: () => import('../views/Home.vue') },
      { path: 'course', name: 'Course', component: () => import('../views/Course.vue') },
      { path: 'my-booking', name: 'MyBooking', component: () => import('../views/MyBooking.vue') },
      
      // --- 新增：钱包页面 ---
      { path: 'wallet', name: 'Wallet', component: () => import('../views/Wallet.vue') },

      // 管理页面
      { path: 'admin-course', name: 'AdminCourse', component: () => import('../views/AdminCourse.vue') },
      { path: 'admin-user', name: 'AdminUser', component: () => import('../views/AdminUser.vue') }
    ]
  },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const user = localStorage.getItem('user')
  if (to.path !== '/login' && !user) {
    next('/login')
  } else {
    next()
  }
})

export default router