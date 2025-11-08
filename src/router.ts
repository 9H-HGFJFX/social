import { createRouter, createWebHashHistory, type NavigationGuardNext, type RouteLocationNormalized } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Home from './pages/Home.vue'
import NewsDetail from './pages/NewsDetail.vue'
import Vote from './pages/Vote.vue'
import ReportNews from './pages/ReportNews.vue'
import ImportRSS from './pages/ImportRSS.vue'

/**
 * 路由元数据接口
 */
interface RouteMeta {
  /** 页面标题 */
  title?: string
  /** 是否需要认证 */
  requiresAuth?: boolean
  /** 是否为公开页面 */
  isPublic?: boolean
}

/**
 * 自定义路由记录类型，包含扩展的元数据
 */
type CustomRouteRecordRaw = RouteRecordRaw & {
  meta?: RouteMeta
}

/**
 * 应用路由配置数组
 */
const routes: CustomRouteRecordRaw[] = [
  {
    path: '/', 
    component: Home,
    meta: {
      title: '首页',
      isPublic: true
    }
  },
  {
    path: '/news/:id', 
    component: NewsDetail,
    meta: {
      title: '新闻详情',
      isPublic: true
    },
    // 路由参数验证
    props: route => ({
      id: Number(route.params.id)
    })
  },
  {
    path: '/news/:id/vote', 
    component: Vote,
    meta: {
      title: '投票',
      isPublic: true
    },
    props: route => ({
      id: Number(route.params.id)
    })
  },
  {
    path: '/report', 
    component: ReportNews,
    meta: {
      title: '报料',
      isPublic: true
    }
  },
  {
    path: '/import', 
    component: ImportRSS,
    meta: {
      title: 'RSS导入',
      isPublic: true
    }
  },
  // 404路由处理
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes,
  linkActiveClass: 'active',
  linkExactActiveClass: 'active',
  // 滚动行为配置
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

/**
 * 全局前置路由守卫
 */
router.beforeEach((to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  try {
    // 设置页面标题
    if (to.meta.title) {
      document.title = `${to.meta.title} - Social Anti-Fake News`
    } else {
      document.title = 'Social Anti-Fake News'
    }

    // 路由参数验证 - 确保新闻ID是有效数字
    if (to.path.startsWith('/news/') && to.params.id) {
      const id = Number(to.params.id)
      if (isNaN(id) || id <= 0) {
        console.warn('无效的新闻ID:', to.params.id)
        next('/')
        return
      }
    }

    // 这里可以添加认证检查逻辑
    // if (to.meta.requiresAuth && !isAuthenticated()) {
    //   next('/login')
    //   return
    // }

    next()
  } catch (error) {
    console.error('路由守卫执行失败:', error)
    next() // 即使出错也要继续导航以避免应用卡死
  }
})

/**
 * 全局后置路由守卫
 */
router.afterEach((to, from) => {
  try {
    // 记录路由切换日志
    console.log(`路由切换: ${from.path} -> ${to.path}`)
  } catch (error) {
    console.error('路由后置守卫执行失败:', error)
  }
})

export default router