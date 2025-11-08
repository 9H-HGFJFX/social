import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import './App.css'
import router from './router'
import { createStore, StoreSymbol } from './store'
import { createI18n, I18nSymbol } from './i18n'

// 全局变量用于存储store实例
let globalStore: ReturnType<typeof createStore> | null = null

/**
 * 初始化并挂载Vue应用
 */
function initializeApp() {
  try {
    // Create application instance
    const app = createApp(App)

    // 强制清除localStorage中的语言设置，确保使用默认的英文
    try {
      localStorage.removeItem('ui_language')
      console.log('已清除localStorage中的语言设置')
    } catch (error) {
      console.warn('无法清除localStorage中的语言设置:', error)
    }
    
    // Initialize store and internationalization
    const store = createStore()
    const i18n = createI18n()
    
    // 确保设置为英文
    i18n.setLang('en')
    console.log('已强制设置语言为英文')
    
    // 重置模拟数据，确保使用英文标题
    try {
      store.resetMockData()
      console.log('已重置模拟数据，使用英文标题')
    } catch (error) {
      console.warn('重置模拟数据失败:', error)
    }
    
    // Provide store and i18n similar to React context
    app.provide(StoreSymbol, store)
    app.provide(I18nSymbol, i18n)
    
    // 保存全局引用
    globalStore = store

    // Add router navigation guard
    router.beforeEach((_to, _from, next) => {
      try {
        store.startProgress()
        next()
      } catch (error) {
        console.error('路由守卫执行失败:', error)
        next() // 即使出错也要继续导航
      }
    })
    
    router.afterEach(() => {
      try {
        store.finishProgress()
      } catch (error) {
        console.error('路由导航完成后执行失败:', error)
      }
    })

    // Add global error handler
    app.config.errorHandler = (err, _instance, info) => {
      console.error('全局错误:', err)
      console.error('错误信息:', info)
    }

    // Add vercel analytics
    try {
      import('@vercel/analytics').then(({ inject: injectAnalytics }) => {
        injectAnalytics()
      }).catch(error => {
        console.warn('Vercel Analytics 注入失败:', error)
      })
    } catch (error) {
      console.warn('加载 Vercel Analytics 失败:', error)
    }

    // Register plugins
    app.use(router)

    // Mount application
    app.mount('#app')
    
    console.log('应用初始化成功')
    
    return app
  } catch (error) {
      console.error('应用初始化失败:', error)
      // 显示友好的错误提示
      const appElement = document.getElementById('app')
      if (appElement) {
        appElement.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            text-align: center;
            padding: 20px;
            font-family: sans-serif;
          ">
            <h1 style="color: #e74c3c;">应用启动失败</h1>
            <p style="color: #555;">请刷新页面重试。如果问题持续存在，请联系管理员。</p>
          </div>
        `
      }
      throw error
    }
  }
  
  // 全局重置函数，可通过浏览器控制台调用
  (window as any).resetMockData = function(options = {}) {
    console.warn('正在重置模拟数据...')
    if (globalStore && globalStore.resetMockData) {
      try {
        // 默认情况下重新生成新闻内容
        const resetOptions = { regenerateNews: true, ...options }
        globalStore.resetMockData(resetOptions)
        
        console.log('模拟数据已重置，正在刷新页面...')
        // 自动刷新页面以显示重置后的数据
        location.reload()
      } catch (error) {
        console.error('重置数据时发生错误:', error)
      }
    } else {
      console.error('无法访问store实例，请在应用完全加载后重试')
    }
  }
  
  // 添加重置数据的便捷提示
  console.log('提示：')
  console.log('- 重置所有数据并生成新的新闻内容: resetMockData()')
  console.log('- 仅重置投票和点赞数据，保持新闻不变: resetMockData({ regenerateNews: false })')

// 启动应用
initializeApp()