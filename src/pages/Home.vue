<template>
  <div class="container">
    <!-- 主布局：左侧筛选 + 右侧内容 -->
    <div class="main-layout">
      <!-- 左侧筛选栏 -->
      <div class="sidebar">
        <h2 class="sidebar-title"></h2>
        
        <!-- 搜索筛选 -->
        <div class="filter-module">
          <h3 class="filter-module-title">Search</h3>
          <div class="search-wrapper">
            <input 
              type="text" 
              v-model="searchKeyword" 
              placeholder="Enter keywords to search"
              class="search-input"
              @input="onSearchChange"
            />
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
        <div class="news-list">
          <RouterLink v-for="n in current" :key="n.id" :to="`/news/${n.id}`" class="news-card">
            <!-- 假新闻角标 -->
            <div v-if="getStatus(n.id) === 'Fake'" class="fake-badge">{{ t('fakeNews') }}</div>
            
            <!-- 新闻图片 -->
            <div class="card-image">
              <img :src="cover(n)" alt="news image" @error="onImgError($event)" />
            </div>
            
            <!-- 卡片内容 -->
            <div class="card-content">
              <h3 class="card-title">{{ localized(n).title }}</h3>
              <p class="card-date">{{ formatDate(n.createdAt) }}</p>
            </div>
          </RouterLink>
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
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useStore, formatDate } from '../store'
import { useI18n } from '../i18n'

type Filter = 'all' | 'fake' | 'not_fake'
type TimeFilter = 'all' | 'day' | 'week' | 'month'

const { state, getStatus, getVoteCounts, clearImported, boostSeedVotes, likeNews, startProgress, finishProgress, localize } = useStore()
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
const pageSize = ref<number>(10) // 固定每页显示10条
const timeFilter = ref<TimeFilter>('all')
const searchKeyword = ref('')
// 可折叠状态
const isCountryExpanded = ref(false)
const isTimeExpanded = ref(false)

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
    (news.source && news.source.toLowerCase().includes(keyword))
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
  const L = lang.value as 'zh' | 'en'
  const mapped = filtered.value.map((n: any) => {
    const x = localize(n, L)
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

const onSearchChange = () => {
  // 搜索变化时自动重置页码
  page.value = 1
}

const prev = () => {
  if (page.value > 1) page.value -= 1
}

const next = () => {
  if (page.value < totalPages.value) page.value += 1
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
  margin-bottom: 16px;
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

/* 新闻列表 */
.news-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

/* 新闻卡片 */
.news-card {
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
  padding: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-date {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
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
  
  .news-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .featured-title {
    font-size: 24px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }
  
  .news-list {
    grid-template-columns: 1fr;
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
