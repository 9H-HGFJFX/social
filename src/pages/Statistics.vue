<template>
  <div class="statistics-container">
    <h1 class="page-title">{{ $t('statistics.title') }}</h1>
    
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">📰</div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.totalNews }}</div>
          <div class="stat-label">{{ $t('statistics.totalNews') }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🗳️</div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.totalVotes }}</div>
          <div class="stat-label">{{ $t('statistics.totalVotes') }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">💬</div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.totalComments }}</div>
          <div class="stat-label">{{ $t('statistics.totalComments') }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">👍</div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.totalNewsLikes }}</div>
          <div class="stat-label">{{ $t('statistics.totalNewsLikes') }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">❤️</div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics.totalCommentLikes }}</div>
          <div class="stat-label">{{ $t('statistics.totalCommentLikes') }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ (statistics.commentLikeRatio * 100).toFixed(1) }}%</div>
          <div class="stat-label">{{ $t('statistics.commentLikeRatio') }}</div>
        </div>
      </div>
    </div>
    
    <div class="stats-section">
      <h2 class="section-title">{{ $t('statistics.newsByStatus') }}</h2>
      <div class="status-distribution">
        <div class="status-item">
          <div class="status-badge fake">
            <span class="status-dot"></span>
            {{ $t('statistics.fakeNews') }}
          </div>
          <div class="status-bar">
            <div 
              class="status-fill fake" 
              :style="{ width: getStatusPercentage('Fake') + '%' }"
            ></div>
          </div>
          <div class="status-count">{{ statistics.newsByStatus['Fake'] }}</div>
        </div>
        
        <div class="status-item">
          <div class="status-badge not-fake">
            <span class="status-dot"></span>
            {{ $t('statistics.notFakeNews') }}
          </div>
          <div class="status-bar">
            <div 
              class="status-fill not-fake" 
              :style="{ width: getStatusPercentage('Not Fake') + '%' }"
            ></div>
          </div>
          <div class="status-count">{{ statistics.newsByStatus['Not Fake'] }}</div>
        </div>
        
        <div class="status-item">
          <div class="status-badge undecided">
            <span class="status-dot"></span>
            {{ $t('statistics.undecidedNews') }}
          </div>
          <div class="status-bar">
            <div 
              class="status-fill undecided" 
              :style="{ width: getStatusPercentage('Undecided') + '%' }"
            ></div>
          </div>
          <div class="status-count">{{ statistics.newsByStatus['Undecided'] }}</div>
        </div>
      </div>
    </div>
    
    <div class="stats-section">
      <h2 class="section-title">{{ $t('statistics.hotNews') }}</h2>
      <div class="hot-news-list">
        <div 
          v-for="(news, index) in statistics.hotNews" 
          :key="news.id" 
          class="hot-news-item"
          @click="navigateToNews(news.id)"
        >
          <div class="hot-news-rank">{{ index + 1 }}</div>
          <div class="hot-news-content">
            <div class="hot-news-title">{{ news.title }}</div>
            <div class="hot-news-metrics">
              <span class="metric-item">👍 {{ news.likes }}</span>
              <span class="metric-item">💬 {{ news.comments }}</span>
            </div>
          </div>
          <div class="hot-news-arrow">→</div>
        </div>
        
        <div v-if="statistics.hotNews.length === 0" class="no-data">
          {{ $t('statistics.noData') }}
        </div>
      </div>
    </div>
    
    <div class="stats-section">
      <h2 class="section-title">{{ $t('statistics.commentLikeAnalysis') }}</h2>
      <div class="analysis-cards">
        <div class="analysis-card">
          <h3 class="analysis-title">{{ $t('statistics.likesPerComment') }}</h3>
          <div class="analysis-value">
            {{ statistics.totalComments > 0 
              ? (statistics.totalCommentLikes / statistics.totalComments).toFixed(2)
              : '0.00'
            }}
          </div>
          <div class="analysis-desc">{{ $t('statistics.averageLikesPerComment') }}</div>
        </div>
        
        <div class="analysis-card">
          <h3 class="analysis-title">{{ $t('statistics.engagementRate') }}</h3>
          <div class="analysis-value">
            {{ statistics.totalNews > 0 
              ? ((statistics.totalNewsLikes + statistics.totalCommentLikes) / statistics.totalNews).toFixed(2)
              : '0.00'
            }}
          </div>
          <div class="analysis-desc">{{ $t('statistics.averageEngagementPerNews') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../store'
const router = useRouter()
const store = useStore()

// 计算统计数据
const statistics = computed(() => store.getStatistics())

// 计算状态百分比
const getStatusPercentage = (status: string): number => {
  if (statistics.value.totalNews === 0) return 0
  return (statistics.value.newsByStatus[status as keyof typeof statistics.value.newsByStatus] / statistics.value.totalNews) * 100
}

// 导航到新闻详情
const navigateToNews = (newsId: number) => {
  router.push(`/news/${newsId}`)
}
</script>

<style scoped>
.statistics-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 2.5rem;
  margin-right: 1rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f4f8;
  border-radius: 50%;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #34495e;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-top: 0.25rem;
}

.stats-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #ecf0f1;
}

.status-distribution {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 120px;
}

.status-badge.fake {
  background: #ffe8e8;
  color: #e74c3c;
}

.status-badge.not-fake {
  background: #e8f5e9;
  color: #27ae60;
}

.status-badge.undecided {
  background: #fff3cd;
  color: #f39c12;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.status-bar {
  flex: 1;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
}

.status-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.status-fill.fake {
  background: #e74c3c;
}

.status-fill.not-fake {
  background: #27ae60;
}

.status-fill.undecided {
  background: #f39c12;
}

.status-count {
  font-weight: bold;
  color: #34495e;
  min-width: 40px;
  text-align: right;
}

.hot-news-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hot-news-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: #f8f9fa;
  cursor: pointer;
  transition: background 0.2s;
}

.hot-news-item:hover {
  background: #e9ecef;
}

.hot-news-rank {
  width: 30px;
  height: 30px;
  background: #3498db;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.hot-news-content {
  flex: 1;
}

.hot-news-title {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hot-news-metrics {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #7f8c8d;
}

.hot-news-arrow {
  color: #95a5a6;
  font-size: 1.2rem;
}

.analysis-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.analysis-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.analysis-title {
  font-size: 1rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.analysis-value {
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.5rem;
}

.analysis-desc {
  font-size: 0.85rem;
  color: #95a5a6;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #95a5a6;
  font-style: italic;
}

@media (max-width: 768px) {
  .statistics-container {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .stats-overview {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .stats-section {
    padding: 1.5rem;
  }
  
  .status-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .status-badge {
    min-width: auto;
  }
  
  .analysis-cards {
    grid-template-columns: 1fr;
  }
}
</style>