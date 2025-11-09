<template>
  <div class="container">
    <!-- 布局控制选项 -->
    <!-- 布局控制选项 -->
    <div class="layout-controls">
      <!-- 每页新闻数量选择 -->
      <div class="control-item">
        <label for="pageSize">{{ t('itemsPerPage') }}:</label>
        <select id="pageSize" v-model="pageSize" @change="onPageSizeChange" class="control-select">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </div>
      
      <!-- 每行显示列数选择 -->
      <div class="control-item">
        <label for="columns">{{ t('columnsPerRow') }}:</label>
        <select id="columns" v-model="columns" @change="onColumnsChange" class="control-select">
          <option :value="1">1</option>
          <option :value="2">2</option>
          <option :value="3">3</option>
          <option :value="4">4</option>
        </select>
      </div>
    </div>
    
    <!-- 主布局：左侧筛选 + 右侧内容 -->
    <div class="main-layout">
      <!-- 左侧筛选栏 -->
      <div class="sidebar">
        <h2 class="sidebar-title"></h2>
        
        <!-- 搜索筛选 -->
        <div class="filter-module">
          <h3 class="filter-module-title">{{ t('search') }}</h3>
          <div class="search-wrapper">
            <input 
              type="text" 
              v-model="searchInputValue" 
              :placeholder="t('searchPlaceholder')"
              class="search-input"
              @input="onSearchChange"
            />
            <div v-if="loading" class="search-loading">⏳</div>
          </div>
        </div>
        
        <!-- 国家筛选 - 可折叠 -->
        <div class="filter-module">
          <h3 class="filter-module-title" @click="isCountryExpanded = !isCountryExpanded">
            {{ t('countries') }}
            <span class="toggle-icon">{{ isCountryExpanded ? '▼' : '▶' }}</span>
          </h3>
          <div class="radio-group" v-show="isCountryExpanded">
            <label class="radio-item">
              <input 
                type="radio" 
                name="country" 
                :checked="selectedCountry === 'all'" 
                @change="setCountry('all')"
              />
              <span class="radio-custom"></span>
              <span class="radio-label">{{ t('all') }}</span>
            </label>
            <label v-for="country in countries" :key="country" class="radio-item">
              <input 
                type="radio" 
                name="country" 
                :checked="selectedCountry === country" 
                @change="setCountry(country)"
              />
              <span class="radio-custom"></span>
              <span class="radio-label">{{ country }}</span>
            </label>
          </div>
        </div>
        
        <!-- 新闻类型筛选 -->
        <div class="filter-module">
          <h3 class="filter-module-title">News Type</h3>
          <div class="radio-group">
            <label class="radio-item">
              <input 
                type="radio" 
                name="filter" 
                :checked="filter === 'all'" 
                @change="setFilter('all')"
              />
              <span class="radio-custom"></span>
              <span class="radio-label">{{ t('all') }}</span>
            </label>
            <label class="radio-item">
              <input 
                type="radio" 
                name="filter" 
                :checked="filter === 'fake'" 
                @change="setFilter('fake')"
              />
              <span class="radio-custom"></span>
              <span class="radio-label">{{ t('fake') }}</span>
            </label>
            <label class="radio-item">
              <input 
                type="radio" 
                name="filter" 
                :checked="filter === 'not_fake'" 
                @change="setFilter('not_fake')"
              />
              <span class="radio-custom"></span>
              <span class="radio-label">{{ t('not_fake') }}</span>
            </label>
          </div>
        </div>
        
        <!-- 时间筛选 - 可折叠 -->
        <div class="filter-module">
          <h3 class="filter-module-title" @click="isTimeExpanded = !isTimeExpanded">
            Time Filter
            <span class="toggle-icon">{{ isTimeExpanded ? '▼' : '▶' }}</span>
          </h3>
          <div class="radio-group" v-show="isTimeExpanded">
            <label class="radio-item">
              <input 
                type="radio" 
                name="timeFilter" 
                :checked="timeFilter === 'all'" 
                @change="setTimeFilter('all')"
              />
              <span class="radio-custom"></span>
              <span class="radio-label">{{ t('all') }} Time</span>
            </label>
            <label class="radio-item">
              <input 
                type="radio" 
                name="timeFilter" 
                :checked="timeFilter === 'day'" 
                @change="setTimeFilter('day')"
              />
              <span class="radio-custom"></span>
              <span class="radio-label">Last 24h</span>
            </label>
            <label class="radio-item">
              <input 
                type="radio" 
                name="timeFilter" 
                :checked="timeFilter === 'week'" 
                @change="setTimeFilter('week')"
              />
              <span class="radio-custom"></span>
              <span class="radio-label">Last Week</span>
            </label>
            <label class="radio-item">
              <input 
                type="radio" 
                name="timeFilter" 
                :checked="timeFilter === 'month'" 
                @change="setTimeFilter('month')"
              />
              <span class="radio-custom"></span>
              <span class="radio-label">Last Month</span>
            </label>
          </div>
        </div>
      </div>
      
      <!-- 右侧内容区 -->
      <div class="content">
        <!-- 统计信息 -->
        <div class="summary-info">
          <span>{{ t('page', { page, total: totalPages, count: filtered.length }) }}</span>
          <span style="margin-left:12px">{{ t('fake') }}: {{ counts.fake }}, {{ t('realNews') }}: {{ counts.notFake }}</span>
        </div>
        
        <!-- 焦点图区域 -->
        <div v-if="featuredNews" class="featured-news">
          <RouterLink :to="`/news/${featuredNews.id}`" class="featured-link">
            <div class="featured-image-wrapper">
              <img :src="cover(featuredNews)" alt="featured news" class="featured-image" />
              <div class="featured-overlay"></div>
              <div class="featured-badge" v-if="getStatus(featuredNews.id) === 'Fake'">{{ t('fakeNews') }}</div>
              <div class="featured-content">
                <h2 class="featured-title">{{ localized(featuredNews).title }}</h2>
                <p class="featured-date">{{ formatDate(featuredNews.createdAt) }}</p>
              </div>
            </div>
          </RouterLink>
        </div>
        
        <div v-if="current.length === 0" style="padding:24px; text-align:center; color:#666666">{{ t('noMatch') }}</div>
        
        <!-- 新闻列表 -->
        <div class="news-list" :class="`columns-${columns}`">
          <div v-for="n in current" :key="n.id" class="news-card-wrapper">
            <RouterLink :to="`/news/${n.id}`" class="news-card">
              <!-- 假新闻角标 -->
              <div v-if="getStatus(n.id) === 'Fake'" class="fake-badge">{{ t('fakeNews') }}</div>
              
              <!-- 新闻图片 -->
              <div class="card-image">
                <img :src="cover(n)" alt="news image" @error="onImgError($event)" />
              </div>
               
              <!-- 卡片内容 -->
              <div class="card-content">
                <h3 class="card-title">{{ localized(n).title }}</h3>
                <div class="card-footer">
                  <p class="card-date">{{ formatDate(n.createdAt) }}</p>
                  <!-- 点赞按钮 -->
              <button 
                class="like-button" 
                :class="{ liked: likedNews.has(n.id) }"
                @click="handleLike($event, n.id)"
                :disabled="loading"
                title="{{ t('like') }}"
              >
                <span v-if="loading" class="like-loading">⏳</span>
                <span v-else class="like-icon">{{ likedNews.has(n.id) ? '❤️' : '🤍' }}</span>
                <span class="like-count">{{ getLikes(n.id) }}</span>
              </button>
                </div>
              </div>
            </RouterLink>
          </div>
        </div>
        
        <!-- 分页器 -->
        <div class="pagination">
          <button :disabled="page <= 1" @click="prev" class="pagination-btn">{{ t('prev') }}</button>
          <span class="pagination-info">{{ page }} / {{ totalPages }}</span>
          <button :disabled="page >= totalPages" @click="next" class="pagination-btn">{{ t('next') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useStore, formatDate } from '../store'
import { useI18n } from '../i18n'
import type { News } from '../types'

type Filter = 'all' | 'fake' | 'not_fake'
type TimeFilter = 'all' | 'day' | 'week' | 'month'

const { state, getStatus, localize, addLike, removeLike, getLikes } = useStore()
const localized = (n: News) => {
  // 直接返回英文标题，绕过localize函数
  if (n.translations?.en?.title) {
    return {
      ...n,
      title: n.translations.en.title,
      summary: n.translations.en.summary || n.summary,
      content: n.translations.en.content || n.content
    }
  }
  // 如果没有英文翻译，生成默认英文标题
  return {
    ...n,
    title: `News Report ${n.id}`,
    summary: `Summary for news ${n.id}`,
    content: `Content for news ${n.id}`
  }
}
const { t, lang } = useI18n()

const filter = ref<Filter>('all')
const selectedCountry = ref('all')
const page = ref(1)
const pageSize = ref<number>(10) // 用户可选择每页显示新闻数量
const columns = ref<number>(3) // 用户可选择每行显示列数
const timeFilter = ref<TimeFilter>('all')
const searchKeyword = ref('')
const searchInputValue = ref('') // 用于输入防抖的中间值
const loading = ref(false) // 加载状态
// 存储用户点赞状态（使用Set避免重复）
const likedNews = ref<Set<number>>(new Set())
// 可折叠状态
const isCountryExpanded = ref(false)
const isTimeExpanded = ref(false)
// 搜索防抖定时器
let searchDebounceTimer: number | undefined

// 预定义国家列表
const countries = ref([
  '中国', '美国', '日本', '英国', '法国', '德国', 
  '俄罗斯', '韩国', '印度', '巴西', '加拿大', '澳大利亚',
  '意大利', '西班牙', '其他'
])

// 从新闻内容中提取国家信息
const getCountry = (news: any): string => {
  const content = `${news.title} ${news.content} ${news.source || ''}`.toLowerCase()
  
  // For English language, return English country names
  if (lang.value === 'en') {
    if (content.includes('中国') || content.includes('china') || content.includes('peking') || content.includes('beijing')) return 'China'
    if (content.includes('美国') || content.includes('america') || content.includes('usa') || content.includes('united states')) return 'United States'
    if (content.includes('日本') || content.includes('japan')) return 'Japan'
    if (content.includes('英国') || content.includes('britain') || content.includes('uk') || content.includes('united kingdom')) return 'United Kingdom'
    if (content.includes('法国') || content.includes('france')) return 'France'
    if (content.includes('德国') || content.includes('germany')) return 'Germany'
    if (content.includes('俄罗斯') || content.includes('russia')) return 'Russia'
    if (content.includes('韩国') || content.includes('korea') || content.includes('seoul')) return 'South Korea'
    if (content.includes('印度') || content.includes('india')) return 'India'
    if (content.includes('巴西') || content.includes('brazil')) return 'Brazil'
    if (content.includes('加拿大') || content.includes('canada')) return 'Canada'
    if (content.includes('澳大利亚') || content.includes('australia')) return 'Australia'
    if (content.includes('意大利') || content.includes('italy')) return 'Italy'
    if (content.includes('西班牙') || content.includes('spain')) return 'Spain'
    return 'Other'
  } else {
    // For Chinese language, return Chinese country names
    if (content.includes('中国') || content.includes('china') || content.includes('peking') || content.includes('beijing')) return '中国'
    if (content.includes('美国') || content.includes('america') || content.includes('usa') || content.includes('united states')) return '美国'
    if (content.includes('日本') || content.includes('japan')) return '日本'
    if (content.includes('英国') || content.includes('britain') || content.includes('uk') || content.includes('united kingdom')) return '英国'
    if (content.includes('法国') || content.includes('france')) return '法国'
    if (content.includes('德国') || content.includes('germany')) return '德国'
    if (content.includes('俄罗斯') || content.includes('russia')) return '俄罗斯'
    if (content.includes('韩国') || content.includes('korea') || content.includes('seoul')) return '韩国'
    if (content.includes('印度') || content.includes('india')) return '印度'
    if (content.includes('巴西') || content.includes('brazil')) return '巴西'
    if (content.includes('加拿大') || content.includes('canada')) return '加拿大'
    if (content.includes('澳大利亚') || content.includes('australia')) return '澳大利亚'
    if (content.includes('意大利') || content.includes('italy')) return '意大利'
    if (content.includes('西班牙') || content.includes('spain')) return '西班牙'
    return '其他'
  }
}

// 根据时间筛选条件过滤新闻
const filterByTime = (news: any): boolean => {
  if (timeFilter.value === 'all') return true
  
  const now = new Date()
  const newsDate = new Date(news.createdAt)
  const diffMs = now.getTime() - newsDate.getTime()
  
  switch (timeFilter.value) {
    case 'day':
      return diffMs <= 24 * 60 * 60 * 1000 // 24小时内
    case 'week':
      return diffMs <= 7 * 24 * 60 * 60 * 1000 // 一周内
    case 'month':
      return diffMs <= 30 * 24 * 60 * 60 * 1000 // 一个月内
    default:
      return true
  }
}

// 根据关键词搜索新闻
const filterByKeyword = (news: any): boolean => {
  if (!searchKeyword.value) return true
  
  const keyword = searchKeyword.value.toLowerCase()
  return (
    news.title.toLowerCase().includes(keyword) ||
    (news.content && news.content.toLowerCase().includes(keyword)) ||
    (news.source && news.source.toLowerCase().includes(keyword)) ||
    (news.summary && news.summary.toLowerCase().includes(keyword))
  )
}

const statusMap = computed(() => {
  const m = new Map<number, ReturnType<typeof getStatus>>()
  for (const n of state.news) m.set(n.id, getStatus(n.id))
  return m
})

const filtered = computed(() => {
  const byDateDesc = (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  
  let filteredNews = [...state.news]
  
  // 应用国家筛选
  if (selectedCountry.value !== 'all') {
    filteredNews = filteredNews.filter(n => getCountry(n) === selectedCountry.value)
  }
  
  // 应用真假新闻筛选
  if (filter.value !== 'all') {
    filteredNews = filteredNews.filter((n) => {
      const st = statusMap.value.get(n.id)
      if (filter.value === 'fake') return st === 'Fake'
      if (filter.value === 'not_fake') return st === 'Not Fake'
      return true
    })
  }
  
  // 应用时间筛选
  filteredNews = filteredNews.filter(filterByTime)
  
  // 应用关键词搜索
  filteredNews = filteredNews.filter(filterByKeyword)
  
  return filteredNews.sort(byDateDesc)
})

// 焦点新闻（第一个假新闻或第一条新闻）
const featuredNews = computed(() => {
  const fakeNews = filtered.value.find(n => getStatus(n.id) === 'Fake')
  return fakeNews || filtered.value[0] || null
})

const counts = computed(() => {
  let fake = 0, notFake = 0
  for (const n of state.news) {
    const st = statusMap.value.get(n.id)
    if (st === 'Fake') fake += 1
    else if (st === 'Not Fake') notFake += 1
  }
  return { fake, notFake }
})

// 本地化处理
const localizedList = computed(() => {
  
  const mapped = filtered.value.map((n: any) => {
    const x = localize(n)
    return { ...n, title: x.title, summary: x.summary, content: x.content, reporter: x.reporter, source: x.source }
  })
  return mapped
})

const totalPages = computed(() => Math.max(1, Math.ceil(localizedList.value.length / pageSize.value)))
const current = computed(() => {
  // 如果有焦点新闻且在当前页，从列表中移除它以避免重复显示
  const list = [...localizedList.value]
  if (featuredNews.value && page.value === 1) {
    const featuredIndex = list.findIndex(n => n.id === featuredNews.value?.id)
    if (featuredIndex !== -1) {
      list.splice(featuredIndex, 1)
    }
  }
  return list.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
})

// 监听器：筛选条件变化时重置页码
watch([filter, selectedCountry, timeFilter, searchKeyword], () => {
  page.value = 1
})

// 监听器：语言变化时重置页码
watch([lang], () => {
  page.value = 1
})

// 方法定义
const setFilter = (f: Filter) => {
  filter.value = f
}

const setCountry = (country: string) => {
  selectedCountry.value = country
}

const setTimeFilter = (time: TimeFilter) => {
  timeFilter.value = time
}

// 搜索防抖函数，避免频繁触发搜索
const onSearchChange = () => {
  // 清除之前的定时器
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  
  // 设置新的定时器
  searchDebounceTimer = window.setTimeout(() => {
    searchKeyword.value = searchInputValue.value
    page.value = 1 // 搜索变化时自动重置页码
  }, 300) // 300ms防抖延迟
}

const prev = () => {
  if (page.value > 1) page.value -= 1
}

const next = () => {
  if (page.value < totalPages.value) page.value += 1
}

// 处理页面大小变化
const onPageSizeChange = () => {
  page.value = 1 // 重置到第一页
}

// 处理列数变化
const onColumnsChange = () => {
  // 列数变化时不需要重置页码
}

// 初始化点赞状态
onMounted(() => {
  initLikedNews()
})

// 新闻点赞相关功能
  // 初始化用户点赞状态
  const initLikedNews = () => {
     try {
       loading.value = true
       const stored = localStorage.getItem('user_likes')
       if (stored) {
         const likes = JSON.parse(stored)
         Object.keys(likes).forEach(id => {
           if (likes[id]) {
             likedNews.value.add(Number(id))
           }
         })
       }
     } catch (error) {
       console.warn('初始化点赞状态失败:', error)
     } finally {
       loading.value = false
     }
   }
  
  // 处理点赞
  const handleLike = async (event: Event, newsId: number) => {
    event.preventDefault()
    event.stopPropagation()
    
    try {
      loading.value = true
      
      if (likedNews.value.has(newsId)) {
        removeLike(newsId)
        likedNews.value.delete(newsId)
      } else {
        addLike(newsId)
        likedNews.value.add(newsId)
      }
      
      // 保存点赞状态到本地存储
      const likes: Record<number, boolean> = {}
      likedNews.value.forEach(id => {
        likes[id] = true
      })
      localStorage.setItem('user_likes', JSON.stringify(likes))
    } catch (error) {
      console.warn('处理点赞失败:', error)
    } finally {
      loading.value = false
    }
  }

// 图片处理
const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540"><rect width="100%" height="100%" fill="%23eef2f7"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="24" font-family="Arial">No Image</text></svg>'
const cover = (n: any) => n.imageUrl || PLACEHOLDER
const onImgError = (e: Event) => {
  (e.target as HTMLImageElement).src = PLACEHOLDER
}
</script>

<style scoped>
/* 全局颜色变量 */
:root {
  --primary-color: #165DFF;
  --warning-color: #FF7D00;
  --success-color: #00B42A;
  --danger-color: #F53F3F;
  --bg-light: #F2F3F5;
  --bg-white: #FFFFFF;
  --text-dark: #333333;
  --text-light: #666666;
  --text-muted: #86909C;
  --border-color: #E8E8E8;
}

/* 容器样式 */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

/* 主布局：左侧筛选 + 右侧内容 */
.main-layout {
  display: flex;
  gap: 24px;
  width: 100%;
}

/* 左侧筛选栏 */
.sidebar {
  width: 25%;
  min-width: 280px;
  background: var(--bg-light);
  border-radius: 8px;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.sidebar-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--text-dark);
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--border-color);
}

.filter-module {
  margin-bottom: 24px;
}

.filter-module-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 12px 0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: color 0.2s ease;
}

.filter-module-title:hover {
  color: var(--primary-color);
}

.toggle-icon {
  font-size: 12px;
  transition: transform 0.2s ease;
}

/* 搜索输入框 */
.search-wrapper {
    position: relative;
    margin-bottom: 16px;
  }
  
  .search-loading {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
  }
  
  .like-loading {
    display: inline-block;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .like-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
}

/* 圆形单选按钮 */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 0;
  font-size: 14px;
  color: var(--text-light);
  transition: color 0.2s ease;
}

.radio-item:hover {
  color: var(--text-dark);
}

.radio-item input[type="radio"] {
  position: absolute;
  opacity: 0;
}

.radio-custom {
  position: relative;
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  margin-right: 10px;
  transition: all 0.2s ease;
}

.radio-item input[type="radio"]:checked + .radio-custom {
  border-color: var(--primary-color);
  background-color: var(--primary-color);
}

.radio-item input[type="radio"]:checked + .radio-custom::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: white;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.radio-label {
  font-size: 14px;
}

/* 右侧内容区 */
.content {
  width: 75%;
}

/* 统计信息 */
.summary-info {
  margin-bottom: 20px;
  padding: 12px 16px;
  background: var(--bg-white);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-dark);
  border: 1px solid var(--border-color);
}

/* 焦点图区域 */
.featured-news {
  margin-bottom: 32px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.featured-link {
  text-decoration: none;
  display: block;
}

.featured-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 33.33%; /* 3:1 宽高比 */
  overflow: hidden;
}

.featured-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.featured-link:hover .featured-image {
  transform: scale(1.02);
}

.featured-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.7));
}

.featured-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background: var(--warning-color);
  color: white;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  z-index: 2;
}

.featured-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 30px;
  z-index: 1;
  color: white;
}

.featured-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 10px 0;
  line-height: 1.3;
}

.featured-date {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

/* 布局控制选项 */
.layout-controls {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: var(--bg-white);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.control-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-item label {
  font-size: 14px;
  color: var(--text-dark);
  font-weight: 500;
}

.control-select {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  background: var(--bg-white);
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1);
}

/* 新闻列表 - 响应式网格布局 */
.news-list {
  display: grid;
  gap: 24px;
  margin-bottom: 32px;
}

/* 根据用户选择的列数设置网格 */
.news-list.columns-1 {
  grid-template-columns: repeat(1, 1fr);
}

.news-list.columns-2 {
  grid-template-columns: repeat(2, 1fr);
}

.news-list.columns-3 {
  grid-template-columns: repeat(3, 1fr);
}

.news-list.columns-4 {
  grid-template-columns: repeat(4, 1fr);
}

/* 新闻卡片包装器 */
.news-card-wrapper {
  position: relative;
}

/* 新闻卡片 */
.news-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  background: var(--bg-white);
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.news-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

/* 假新闻角标 */
.fake-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--warning-color);
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  z-index: 1;
}

/* 卡片图片 */
.card-image {
  width: 100%;
  padding-top: 75%; /* 4:3 宽高比 */
  position: relative;
  overflow: hidden;
}

.card-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 卡片内容 */
.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.card-date {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

/* 点赞按钮 */
.like-button {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f0f2f5;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-light);
  transition: all 0.2s ease;
  min-width: 60px;
}

.like-button:hover {
  background: #ffebef;
  border-color: #ff4d4f;
  transform: translateY(-1px);
}

.like-button.liked {
  background: #ff4d4f;
  border-color: #ff4d4f;
  color: white;
}

.like-button.liked:hover {
  background: #ff7875;
}

.like-icon {
  font-size: 14px;
}

.like-count {
  font-weight: 500;
}

/* 分页器 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 20px 0;
}

.pagination-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  background: var(--bg-white);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 14px;
  color: var(--text-light);
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  font-weight: 500;
  color: var(--primary-color);
  min-width: 60px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    position: static;
    min-width: auto;
  }
  
  .content {
    width: 100%;
  }
  
  /* 在小屏幕上强制使用列数设置，而不是覆盖用户选择 */
  .news-list {
    gap: 20px;
  }
  
  /* 仅在移动设备上覆盖用户选择 */
  @media (max-width: 768px) {
    .news-list {
      grid-template-columns: repeat(1, 1fr) !important;
    }
  }
  
  .featured-title {
    font-size: 24px;
  }
  
  .layout-controls {
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }
  
  /* 移动设备上强制使用单列布局 */
  .news-list {
    gap: 16px;
  }
  
  .featured-content {
    padding: 20px;
  }
  
  .featured-title {
    font-size: 20px;
  }
  
  .sidebar {
    padding: 16px;
  }
  
  .radio-group {
    max-height: 200px;
    overflow-y: auto;
  }
  
  /* 优化卡片底部按钮在移动端的显示 */
  .card-footer {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .like-button {
    flex: 1;
    justify-content: center;
    font-size: 12px;
    padding: 6px 8px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 10px;
  }
  
  .main-layout {
    gap: 16px;
  }
  
  .featured-content {
    padding: 16px;
  }
  
  .featured-title {
    font-size: 18px;
  }
  
  .fake-badge,
  .featured-badge {
    padding: 3px 8px;
    font-size: 11px;
  }
}
</style>
