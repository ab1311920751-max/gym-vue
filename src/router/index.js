import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue')
    },
    {
        path: '/',
        component: () => import('../views/Layout.vue'),
        redirect: '/home', // 默认跳去首页
        children: [
            {
                path: 'home',
                name: 'Home',
                component: () => import('../views/Home.vue')
            },
            // 这里先留个坑，等下写课程列表
            {
                path: 'course',
                name: 'Course',
                component: () => import('../views/Course.vue') // <--- 修改这里
            },
            // ... 在 children 数组里追加
            {
                path: 'my-booking',
                name: 'MyBooking',
                component: () => import('../views/MyBooking.vue')
            }
// ...
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫：没登录不许进首页
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    if (to.path !== '/login' && !token) {
        next('/login')
    } else {
        next()
    }
})

export default router