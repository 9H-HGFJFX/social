<template>
  <div class="container" v-if="n">
    <!-- 顶部区域 -->
    <div class="news-header">
      <!-- 左侧：标题和状态标签 -->
      <div class="header-left">
        <div class="title-container">
          <h1 class="title">{{ L?.title }}</h1>
          <div class="status-tag" :class="statusClass(status)">
            {{ status === 'Fake' ? '❌ ' + t('status_fake') : status === 'Not Fake' ? '✅ ' + t('status_not_fake') : t('status_undecided') }}
          </div>
        </div>
      </div>
      
      <!-- 右侧：元信息 -->
      <div class="header-right">
        <div class="meta-item">
          <span class="meta-label">Country:</span>
          <span class="meta-value">{{ getCountry(n) }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Date:</span>
          <span class="meta-value">{{ formatDate(n.createdAt) }}</span>
        </div>
        <div class="meta-item" v-if="L?.source">
          <span class="meta-label">Source:</span>
          <span class="meta-value">{{ L?.source }}</span>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="news-content">
      <!-- 新闻图片 - 全屏宽度 -->
      <div class="news-image-container">
        <img :src="cover(n)" alt="image" class="news-image" @error="onImgError($event)" @click="handleImageClick($event)" />
        <div class="image-zoom-hint">🔍 click to see</div>
      </div>

      <!-- 正文内容 -->
      <div class="article-content">
        <p class="content-text">{{ L?.content }}</p>
      </div>
    </div>

    <!-- 互动区域 -->
    <div class="interaction-section">
      <!-- 投票按钮 - 全屏宽度 -->
      <div class="vote-buttons">
        <RouterLink class="btn vote-true" :to="`/news/${n.id}/vote`">
          ✅ {{ t('goVote') }}
        </RouterLink>
        <RouterLink class="btn vote-fake" :to="`/news/${n.id}/vote`">
          ❌ {{ t('fakeOption') }}
        </RouterLink>
        <a v-if="n.link" class="btn view-original" :href="n.link" target="_blank" rel="noopener">
          🌐 {{ t('viewOriginal') }}
        </a>
      </div>

      <!-- 投票结果 -->
      <div class="vote-results">
        <h3 class="section-title">{{ t('voteResults') }}</h3>
        <div class="vote-stats">
          <div class="vote-stat-item">
            <span class="vote-label">{{ t('fakeShort') }}:</span>
            <span class="vote-count fake">{{ counts.fake }}</span>
          </div>
          <div class="vote-stat-item">
            <span class="vote-label">{{ t('notFakeShort') }}:</span>
            <span class="vote-count not-fake">{{ counts.not_fake }}</span>
          </div>
          <div class="vote-stat-item total">
            <span class="vote-label">{{ t('total_votes') }}:</span>
            <span class="vote-count">{{ counts.fake + counts.not_fake }}</span>
          </div>
        </div>
      </div>

      <!-- 评论区 -->
      <div class="comments-section">
        <h3 class="section-title">{{ t('commentsTitle') }}</h3>
        
        <div v-if="current.length === 0" class="no-comments">{{ t('noComments') }}</div>
        
        <div class="comments-list" v-else>
          <div v-for="c in current" :key="c.id" class="comment-item">
            <div class="comment-header">
              <div class="comment-user">{{ c.voter ?? t('anonymous') }}</div>
              <div class="comment-meta">
                <span class="comment-time">{{ formatDate(c.createdAt) }}</span>
                <span class="comment-choice" :class="c.choice">
                  {{ c.choice === 'fake' ? '❌ ' + t('fakeShort') : '✅ ' + t('notFakeShort') }}
                </span>
              </div>
            </div>
            <div class="comment-content">
              <p v-if="c.comment">{{ c.comment }}</p>
              <img v-if="c.imageUrl" :src="c.imageUrl" alt="comment image" class="comment-image" />
            </div>
          </div>
        </div>

        <!-- 评论分页 -->
        <div class="comments-pagination">
          <span class="page-info">{{ t('page', { page, total: totalPages, count: comments.length }) }}</span>
          <div class="pagination-controls">
            <button class="btn pagination-btn" @click="prev" :disabled="page<=1">{{ t('prev') }}</button>
            <button class="btn pagination-btn" @click="next" :disabled="page>=totalPages">{{ t('next') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 未找到页面 -->
  <div class="container" v-else>
    <div class="not-found">
      <h2>{{ t('notFound') }}</h2>
      <RouterLink class="btn back-home" to="/">{{ t('backHome') }}</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useStore, formatDate } from '../store'
import { useI18n } from '../i18n'

const route = useRoute()
const id = Number(route.params.id)
const { state, getStatus, getVoteCounts, getComments, localize } = useStore()
const { t, lang } = useI18n()
const n = computed(() => state.news.find((x) => x.id === id))
const L = computed(() => n.value ? localize(n.value, lang.value as 'zh' | 'en') : undefined)
const page = ref(1)
const pageSize = ref(5)
const comments = computed(() => {
    const cmts = getComments(id)
    return cmts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })
const totalPages = computed(() => Math.max(1, Math.ceil(comments.value.length / pageSize.value)))
const current = computed(() => comments.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
const status = computed(() => n.value ? getStatus(n.value.id) : 'Undecided')
const counts = computed(() => n.value ? getVoteCounts(n.value.id) : { fake:0, not_fake:0 })

// 国家判断函数
const getCountry = (news: any): string => {
  // 基于新闻内容、来源或主题判断国家
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

const prev = () => { if (page.value > 1) page.value -= 1 }
const next = () => { if (page.value < totalPages.value) page.value += 1 }

const statusClass = (st: ReturnType<typeof getStatus>) => st === 'Fake' ? 'fake' : st === 'Not Fake' ? 'not-fake' : 'undecided'

// 图片预览功能
const handleImageClick = (e: Event) => {
  const img = e.target as HTMLImageElement
  if (img && img.src) {
    window.open(img.src, '_blank')
  }
}

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540"><rect width="100%" height="100%" fill="%23eef2f7"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="24" font-family="Arial">No Image</text></svg>'
const cover = (n: any) => n?.imageUrl || PLACEHOLDER
const onImgError = (e: Event) => { (e.target as HTMLImageElement).src = PLACEHOLDER }
</script>

<style scoped>
.container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    width: 100%;
    box-sizing: border-box;
  }

  .news-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    flex-wrap: wrap;
    gap: 20px;
  }

.header-left {
  flex: 1;
  min-width: 300px;
}

.title-container {
  position: relative;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #1D2129;
  line-height: 1.3;
  margin: 0 0 16px 0;
}

.status-tag {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
}

.status-tag.fake {
  background: #F53F3F;
  color: white;
}

.status-tag.not-fake {
  background: #00B42A;
  color: white;
}

.status-tag.undecided {
  background: #86909C;
  color: white;
}

.header-right {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-label {
  font-size: 14px;
  color: #666666;
  font-weight: 500;
}

.meta-value {
  font-size: 14px;
  color: #1D2129;
  font-weight: 600;
}

/* 内容区域样式 */
.news-content {
  margin-bottom: 32px;
}

/* 新闻图片 - 全屏宽度 */
.news-image-container {
  width: 100%;
  margin-bottom: 24px;
  position: relative;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.news-image {
  width: 100%;
  height: auto;
  max-height: 500px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.news-image-container:hover .news-image {
  transform: scale(1.02);
}

.image-zoom-hint {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

/* 正文内容 */
.article-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.content-text {
  font-size: 16px;
  line-height: 1.8;
  color: #1D2129;
  margin: 0;
  white-space: pre-wrap;
}

/* 互动区域样式 */
.interaction-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 投票按钮 */
.vote-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
}

.vote-true {
  background: #00B42A;
  color: white;
  flex: 1;
  min-width: 160px;
}

.vote-true:hover {
  background: #00A626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 180, 42, 0.3);
}

.vote-fake {
  background: #F53F3F;
  color: white;
  flex: 1;
  min-width: 160px;
}

.vote-fake:hover {
  background: #E6393F;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 63, 63, 0.3);
}

.view-original {
  background: #165DFF;
  color: white;
  flex: 1;
  min-width: 160px;
}

.view-original:hover {
  background: #0E4DD3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 93, 255, 0.3);
}

/* 投票结果 */
.vote-results {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #1D2129;
  margin: 0 0 16px 0;
}

.vote-stats {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  flex-wrap: wrap;
}

.vote-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.vote-label {
  font-size: 14px;
  color: #666666;
  margin-bottom: 4px;
}

.vote-count {
  font-size: 24px;
  font-weight: bold;
}

.vote-count.fake {
  color: #F53F3F;
}

.vote-count.not-fake {
  color: #00B42A;
}

.vote-stat-item.total .vote-count {
  color: #165DFF;
}

/* 评论区 */
.comments-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.no-comments {
  text-align: center;
  color: #666666;
  padding: 20px 0;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.comment-item:hover {
  border-color: #165DFF;
  box-shadow: 0 2px 8px rgba(22, 93, 255, 0.1);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.comment-user {
  font-weight: 600;
  color: #1D2129;
  font-size: 14px;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}

.comment-time {
  color: #86909C;
}

.comment-choice {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.comment-choice.fake {
  background: #FFECE8;
  color: #F53F3F;
}

.comment-choice.not-fake {
  background: #E8F8EE;
  color: #00B42A;
}

.comment-content {
  font-size: 14px;
  line-height: 1.6;
  color: #4E5969;
}

.comment-image {
  max-width: 100%;
  border-radius: 6px;
  margin-top: 8px;
}

/* 评论分页 */
.comments-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.page-info {
  font-size: 14px;
  color: #666666;
}

.pagination-controls {
  display: flex;
  gap: 8px;
}

.pagination-btn {
  padding: 8px 16px;
  font-size: 14px;
  background: #f5f5f5;
  color: #1D2129;
  border: 1px solid #d9d9d9;
}

.pagination-btn:hover:not(:disabled) {
  background: #165DFF;
  color: white;
  border-color: #165DFF;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 未找到页面 */
.not-found {
  text-align: center;
  padding: 60px 20px;
}

.not-found h2 {
  font-size: 24px;
  color: #1D2129;
  margin-bottom: 20px;
}

.back-home {
  background: #165DFF;
  color: white;
  padding: 10px 24px;
}

.back-home:hover {
  background: #0E4DD3;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .content-text {
    font-size: 14px;
  }
  
  .vote-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .header-right {
    width: 100%;
  }
  
  .meta-item {
    justify-content: flex-start;
    gap: 12px;
  }
  
  .vote-stats {
    flex-direction: column;
    align-items: center;
  }
  
  .vote-stat-item {
    width: 100%;
  }
  
  .comments-pagination {
    justify-content: center;
  }
  
  .page-info {
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 12px;
  }
  
  .news-header,
  .article-content,
  .vote-results,
  .comments-section {
    padding: 16px;
  }
  
  .title {
    font-size: 20px;
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .vote-count {
    font-size: 20px;
  }
}
</style>