import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/tickets'
  },
  {
    path: '/tickets',
    name: 'TicketList',
    component: () => import('@/views/TicketList.vue'),
    meta: { title: '报修工单列表' }
  },
  {
    path: '/tickets/:id',
    name: 'TicketDetail',
    component: () => import('@/views/TicketDetail.vue'),
    meta: { title: '工单详情' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title as string} - 商业楼宇设备报修管理系统`
  }
  next()
})

export default router
