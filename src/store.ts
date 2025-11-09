/**
 * 新闻反假平台状态管理模块
 */
import { inject, ref, reactive } from 'vue'
import type { News, Vote, VoteCounts, NewsStatus, VoteChoice, CommentLike } from './types'
import { createSeedNews, generateMockVotes, generateMockCommentLikes, type InternalNews, nextId, genVoteId } from './mockData'

export const StoreSymbol = Symbol('store')

/**
 * 格式化ISO日期字符串为可读格式
 * @param iso ISO日期字符串
 * @returns 格式化后的日期字符串 (YYYY-MM-DD HH:mm)
 */
export const formatDate = (iso: string): string => {
  try {
    const d = new Date(iso)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${day} ${hh}:${mm}`
  } catch (error) {
    console.warn('日期格式化失败:', error)
    return iso
  }
}



/**
 * 创建全局状态管理实例
 * @returns 状态管理对象
 */
export function createStore() {
  // 状态初始化
  const news = ref<InternalNews[]>(createSeedNews())
  
  /**
 * 从本地存储初始化投票数据，当本地存储为空时使用模拟数据
 */
  const initVotes = (): Vote[] => {
    try {
      const raw = localStorage.getItem('votes')
      
      // 如果有本地存储数据，使用它
      if (raw) {
        const parsed = JSON.parse(raw) as Vote[]
        
        // 数据验证：确保数组元素包含必要字段
        if (Array.isArray(parsed)) {
          return parsed.filter((v) => 
            typeof (v as Vote).newsId === 'number' && 
            ['fake', 'not_fake'].includes((v as Vote).choice as 'fake' | 'not_fake')
          )
        }
      }
      
      // 如果没有本地存储数据或解析失败，生成模拟投票数据
      const newsIds = news.value.map(n => n.id)
      const mockVotes = generateMockVotes(newsIds, 8) // 每条新闻生成更多投票数据以丰富展示
      
      // 保存到本地存储
      localStorage.setItem('votes', JSON.stringify(mockVotes))
      
      return mockVotes
    } catch (error) {
      console.warn('初始化投票数据失败，使用模拟数据:', error)
      
      // 出错时也使用模拟数据
      const newsIds = news.value.map(n => n.id)
      return generateMockVotes(newsIds, 8)
    }
  }
  
  const votes = ref<Vote[]>(initVotes())
  
  /**
 * 从本地存储初始化点赞数据，当本地存储为空时为每条新闻生成随机点赞数
 */
  const initLikes = (): Record<number, number> => {
    try {
      const raw = localStorage.getItem('likes_by_news')
      
      // 如果有本地存储数据，使用它
      if (raw) {
        const parsed = JSON.parse(raw)
        
        // 确保返回有效的记录对象
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed
        }
      }
      
      // 如果没有本地存储数据或解析失败，为每条新闻生成随机点赞数
      const mockLikes: Record<number, number> = {}
      news.value.forEach(newsItem => {
        // 为每条新闻生成5-30个随机点赞数
        mockLikes[newsItem.id] = Math.floor(Math.random() * 26) + 5
      })
      
      // 保存到本地存储
      localStorage.setItem('likes_by_news', JSON.stringify(mockLikes))
      
      return mockLikes
    } catch (error) {
      console.warn('初始化点赞数据失败，使用模拟数据:', error)
      
      // 出错时也使用模拟数据
      const mockLikes: Record<number, number> = {}
      news.value.forEach(newsItem => {
        mockLikes[newsItem.id] = Math.floor(Math.random() * 26) + 5
      })
      
      return mockLikes
    }
  }
  
  const likesByNews = ref<Record<number, number>>(initLikes())
  
  /**
 * 从本地存储初始化评论点赞数据，当本地存储为空时使用模拟数据
 */
  const initCommentLikes = (): CommentLike[] => {
    try {
      const raw = localStorage.getItem('comment_likes')
      
      // 如果有本地存储数据，使用它
      if (raw) {
        const parsed = JSON.parse(raw)
        
        // 数据验证
        if (Array.isArray(parsed)) {
          return parsed.filter((like: any) => 
            typeof like.commentId === 'string' && 
            typeof like.userId === 'string' &&
            typeof like.createdAt === 'string'
          )
        }
      }
      
      // 如果没有本地存储数据或解析失败，从现有投票中提取评论ID并生成模拟点赞
      const commentIds = votes.value
        .filter(vote => vote.comment) // 只处理有评论的投票
        .map(vote => vote.id.toString()) // 使用投票ID作为评论ID
      
      const mockCommentLikes = generateMockCommentLikes(commentIds)
      
      // 保存到本地存储
      localStorage.setItem('comment_likes', JSON.stringify(mockCommentLikes))
      
      return mockCommentLikes
    } catch (error) {
      console.warn('初始化评论点赞数据失败，使用模拟数据:', error)
      
      // 出错时也使用模拟数据
      const commentIds = votes.value
        .filter(vote => vote.comment)
        .map(vote => vote.id.toString())
      
      return generateMockCommentLikes(commentIds)
    }
  }

  
  const commentLikes = ref<CommentLike[]>(initCommentLikes())

  // 全局进度条状态
  const progressActive = ref(false)
  const progressValue = ref(0)
  let progressTimer: number | undefined
  
  /**
   * 开始显示进度条
   */
  const startProgress = (): void => {
    if (progressTimer) {
      clearInterval(progressTimer)
    }
    
    progressActive.value = true
    progressValue.value = 0
    progressTimer = window.setInterval(() => {
      // 缓动到95%
      const inc = 5 + Math.random() * 10
      progressValue.value = Math.min(95, progressValue.value + inc)
    }, 150)
  }
  
  /**
   * 完成进度条动画并隐藏
   */
  const finishProgress = (): void => {
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = undefined
    }
    
    progressValue.value = 100
    setTimeout(() => {
      progressActive.value = false
      progressValue.value = 0
    }, 300)
  }

  /**
   * 将点赞数据持久化到本地存储
   */
  const persistLikes = (): void => {
    try {
      localStorage.setItem('likes_by_news', JSON.stringify(likesByNews.value))
    } catch (error) {
      console.warn('持久化点赞数据失败:', error)
    }
  }
  
  /**
   * 将评论点赞数据持久化到本地存储
   */
  const persistCommentLikes = (): void => {
    try {
      localStorage.setItem('comment_likes', JSON.stringify(commentLikes.value))
    } catch (error) {
      console.warn('持久化评论点赞数据失败:', error)
    }
  }
  
  /**
   * 将投票数据持久化到本地存储
   */
  const persistVotes = (): void => {
    try {
      localStorage.setItem('votes', JSON.stringify(votes.value))
    } catch (error) {
      console.warn('持久化投票数据失败:', error)
    }
  }

  /**
   * 添加新的新闻
   * @param n 新闻数据
   */
  const addNews = (n: { 
    title: string; 
    summary: string; 
    content: string; 
    reporter: string; 
    imageUrl?: string 
  }): void => {
    const id = nextId(news.value)
    const item: InternalNews = {
      id,
      title: n.title.trim(),
      summary: n.summary.trim(),
      content: n.content.trim(),
      reporter: n.reporter.trim(),
      createdAt: new Date().toISOString(),
      imageUrl: n.imageUrl?.trim() || undefined,
      __imported: false,
    }
    news.value = [item, ...news.value]
  }

  /**
   * 添加导入的新闻
   * @param n 导入的新闻数据
   */
  const addNewsImported = (n: Omit<News, 'id' | 'createdAt'> & { createdAt?: string }): void => {
    const id = nextId(news.value)
    const item: InternalNews = {
      id,
      title: n.title,
      summary: n.summary,
      content: n.content,
      reporter: n.reporter,
      createdAt: n.createdAt ?? new Date().toISOString(),
      imageUrl: n.imageUrl,
      source: n.source,
      link: n.link,
      __imported: true,
    }
    news.value = [item, ...news.value]
  }

  /**
   * 添加新的投票
   * @param v 投票数据
   */
  const addVote = (v: { 
    newsId: number; 
    choice: VoteChoice; 
    comment?: string; 
    imageUrl?: string; 
    voter?: string 
  }): void => {
    const item: Vote = {
      id: genVoteId(),
      newsId: v.newsId,
      choice: v.choice,
      comment: v.comment?.trim() || undefined,
      imageUrl: v.imageUrl?.trim() || undefined,
      voter: v.voter?.trim() || undefined,
      createdAt: new Date().toISOString(),
    }
    votes.value = [item, ...votes.value]
    persistVotes()
  }

  /**
   * 获取指定新闻的投票计数
   * @param newsId 新闻ID
   * @returns 投票计数对象
   */
  const getVoteCounts = (newsId: number): VoteCounts => {
    let fake = 0, not_fake = 0, undecided = 0
    
    for (const v of votes.value) {
      if (v.newsId !== newsId) continue
      
      if (v.choice === 'fake') fake += 1
      else if (v.choice === 'not_fake') not_fake += 1
      else if (v.choice === 'undecided') undecided += 1
    }
    
    return { fake, not_fake, undecided }
  }

  /**
   * 获取指定新闻的状态（真/假/未决定）
   * @param newsId 新闻ID
   * @returns 新闻状态
   */
  const getStatus = (newsId: number): NewsStatus => {
    const c = getVoteCounts(newsId)
    
    if (c.fake > c.not_fake) return 'Fake'
    if (c.not_fake > c.fake) return 'Not Fake'
    return 'Undecided'
  }

  /**
   * 获取指定新闻的评论列表
   * @param newsId 新闻ID
   * @returns 评论列表
   */
  const getComments = (newsId: number): Vote[] => {
    return votes.value.filter((v) => 
      v.newsId === newsId && (v.comment || v.imageUrl)
    )
  }

  /**
   * 清空导入的新闻和相关投票
   */
  const clearImported = (): void => {
    const keep = news.value.filter((n) => !n.__imported)
    const removedIds = new Set(
      news.value.filter((n) => n.__imported).map((n) => n.id)
    )
    
    news.value = keep
    // 移除与删除的导入新闻相关的投票
    votes.value = votes.value.filter((v) => !removedIds.has(v.newsId))
    persistVotes()
  }

  /**
   * 生成指定范围内的随机整数
   * @param min 最小值
   * @param max 最大值
   * @returns 随机整数
   */
  const rand = (min: number, max: number): number => 
    Math.floor(Math.random() * (max - min + 1)) + min
  
  /**
   * 为种子新闻补充投票
   * @param min 最小投票数
   * @param max 最大投票数
   */
  const boostSeedVotes = (min: number, max: number): void => {
    for (const n of news.value) {
      if (!n.__seed) continue
      
      const counts = getVoteCounts(n.id)
      const total = counts.fake + counts.not_fake
      const target = rand(min, max)
      const add = Math.max(0, target - total)
      
      for (let i = 0; i < add; i += 1) {
        const choice: VoteChoice = Math.random() < 0.5 ? 'fake' : 'not_fake'
        addVote({ newsId: n.id, choice })
      }
    }
  }

  // Prime half seeds to Fake, half to Not Fake to make statuses visible
  const primeSeedStatuses = () => {
    const half = Math.floor(news.value.length / 2)
    for (let i = 0; i < news.value.length; i += 1) {
      const n = news.value[i]
      if (!n.__seed) continue
      const makeFakeMajority = i < half
      // 减少投票数量以提升性能
      const fakeCount = makeFakeMajority ? 5 : 2
      const notFakeCount = makeFakeMajority ? 2 : 5
      for (let f = 0; f < fakeCount; f += 1) addVote({ newsId: n.id, choice: 'fake' })
      for (let nf = 0; nf < notFakeCount; nf += 1) addVote({ newsId: n.id, choice: 'not_fake' })
    }
  }

  /**
   * 为新闻添加点赞
   * @param newsId 新闻ID
   */
  const addLike = (newsId: number): void => {
    try {
      if (!likesByNews.value[newsId]) likesByNews.value[newsId] = 0
      likesByNews.value[newsId] += 1
      persistLikes()
    } catch (error) {
      console.warn('添加点赞失败:', error)
    }
  }
  
  /**
   * 取消新闻点赞
   * @param newsId 新闻ID
   */
  const removeLike = (newsId: number): void => {
    try {
      if (likesByNews.value[newsId] > 0) {
        likesByNews.value[newsId] -= 1
        if (likesByNews.value[newsId] === 0) {
          delete likesByNews.value[newsId]
        }
        persistLikes()
      }
    } catch (error) {
      console.warn('取消点赞失败:', error)
    }
  }
  
  /**
   * 获取新闻点赞数
   * @param newsId 新闻ID
   * @returns 点赞数
   */
  const getLikes = (newsId: number): number => {
    return likesByNews.value[newsId] || 0
  }

  /**
   * 批量操作：删除所有新闻及其相关数据
   */
  const removeAllNews = (): void => {
    try {
      news.value = []
      votes.value = []
      likesByNews.value = {}
      commentLikes.value = []
      persistVotes()
      persistLikes()
      persistCommentLikes()
    } catch (error) {
      console.warn('删除所有新闻失败:', error)
      // 重置到安全状态
      news.value = []
      votes.value = []
      likesByNews.value = {}
      commentLikes.value = []
    }
  }
  
  /**
   * 重置所有模拟数据
   * @param options 重置选项
   */
  const resetMockData = ({ 
    regenerateNews = true // 是否重新生成新闻内容
  }: { regenerateNews?: boolean } = {}): void => {
    try {
      // 根据选项决定是否重新生成新闻
      if (regenerateNews) {
        // 重新生成新闻内容
        news.value = createSeedNews()
        console.log('已生成新的新闻内容')
      }
      
      // 重置本地存储
      localStorage.removeItem('votes')
      localStorage.removeItem('likes_by_news')
      localStorage.removeItem('comment_likes')
      
      // 重置状态
      votes.value = []
      likesByNews.value = {}
      commentLikes.value = []
      
      // 确保有足够的新闻数据用于测试
      if (news.value.length < 60) {
        // 如果当前新闻不足60条，生成新的种子新闻
        news.value = createSeedNews()
      }
      
      // 初始化模拟数据 - 使用从mockData导入的函数
      const newsIds = news.value.map(n => n.id)
      
      // 生成模拟投票数据
      votes.value = generateMockVotes(newsIds, 12) // 每条新闻12个投票
      
      // 为所有新闻生成随机点赞数（5-30个）
      news.value.forEach(newsItem => {
        likesByNews.value[newsItem.id] = Math.floor(Math.random() * 26) + 5
      })
      
      // 从生成的投票中提取评论ID并生成评论点赞数据
      const commentIds = votes.value
        .filter(vote => vote.comment)
        .map(vote => vote.id.toString())
      
      commentLikes.value = generateMockCommentLikes(commentIds)
      
      // 持久化重置后的数据
      persistVotes()
      persistLikes()
      persistCommentLikes()
      
      console.log('模拟数据已成功重置' + (regenerateNews ? '，并生成了新的新闻内容' : '，新闻内容保持不变'))
    } catch (error) {
      console.error('重置模拟数据失败:', error)
      // 错误情况下尝试恢复基本数据
      try {
        if (regenerateNews) {
          news.value = createSeedNews()
        }
        votes.value = []
        likesByNews.value = {}
      } catch (recoverError) {
        console.error('数据恢复失败:', recoverError)
      }
    }
  }

  // 兼容旧版接口
  const likeNews = (id: number) => addLike(id)

  // Auto randomize likes, votes and comments for all news
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
  const randomizeEngagement = (opts?: { likeMin?: number; likeMax?: number; voteMin?: number; voteMax?: number; commentRate?: number; imageRate?: number }) => {
    const likeMin = opts?.likeMin ?? 5
    const likeMax = opts?.likeMax ?? 60
    const voteMin = opts?.voteMin ?? 8
    const voteMax = opts?.voteMax ?? 24
    const commentRate = opts?.commentRate ?? 0.35
    const imageRate = opts?.imageRate ?? 0.12
    const phrases = [
      'Needs more evidence', 'Looks suspicious', 'Seems legitimate', 'Source is reliable',
      'Unverified claim', 'Eyewitness report', 'Possible misinformation', 'Cross-check required',
    ]
    for (const n of news.value) {
      const likeAdd = rand(likeMin, likeMax)
      likesByNews.value[n.id] = (likesByNews.value[n.id] ?? 0) + likeAdd
      const vCount = rand(voteMin, voteMax)
      for (let i = 0; i < vCount; i += 1) {
        const choice: VoteChoice = Math.random() < 0.5 ? 'fake' : 'not_fake'
        const withComment = Math.random() < commentRate
        const withImage = Math.random() < imageRate
        const comment = withComment ? pick(phrases) : undefined
        const imageUrl = withImage ? `https://picsum.photos/seed/cmt-${n.id}-${i}/400/240` : undefined
        const voter = Math.random() < 0.4 ? `User${rand(1000,9999)}` : undefined
        addVote({ newsId: n.id, choice, comment, imageUrl, voter })
      }
    }
    persistLikes()
    persistVotes()
  }

  // Optional: auto import RSS is disabled by default; can be re-enabled via env
  const autoImport = String((import.meta as ImportMeta).env?.VITE_AUTO_IMPORT_RSS || '').toLowerCase() === 'true'
  
  // 确保始终初始化足够的数据，不仅在votes为空时
  // 先清空现有数据以确保一致的初始化
  votes.value = []
  likesByNews.value = []
  
  // 重新生成种子新闻的投票状态
  primeSeedStatuses()
  
  // 为所有新闻生成丰富的互动数据，包括更多评论
  randomizeEngagement({
    likeMin: 10,    // 增加点赞数最小值
    likeMax: 80,    // 增加点赞数最大值
    voteMin: 15,    // 增加投票数最小值
    voteMax: 40,    // 增加投票数最大值
    commentRate: 0.5, // 提高评论率至50%
    imageRate: 0.2   // 提高图片评论率至20%
  })
  
  if (autoImport) {
    // Intentionally left as a no-op here to avoid network error logs; manual import page handles RSS
  }

  // 为评论添加点赞
  const addCommentLike = (commentId: string, userId: string): void => {
    try {
      // 检查是否已经点赞
      const existingLike = commentLikes.value.find(
        like => like.commentId === commentId && like.userId === userId
      )
      
      if (!existingLike) {
        const like: CommentLike = {
          commentId,
          userId,
          createdAt: new Date().toISOString()
        }
        commentLikes.value.push(like)
        persistCommentLikes()
      }
    } catch (error) {
      console.warn('添加评论点赞失败:', error)
    }
  }
  
  // 取消评论点赞
  const removeCommentLike = (commentId: string, userId: string): void => {
    try {
      const index = commentLikes.value.findIndex(
        like => like.commentId === commentId && like.userId === userId
      )
      
      if (index !== -1) {
        commentLikes.value.splice(index, 1)
        persistCommentLikes()
      }
    } catch (error) {
      console.warn('取消评论点赞失败:', error)
    }
  }
  
  // 获取评论的点赞数
  const getCommentLikesCount = (commentId: string): number => {
    return commentLikes.value.filter(like => like.commentId === commentId).length
  }
  
  // 检查用户是否已点赞评论
  const hasUserLikedComment = (commentId: string, userId: string): boolean => {
    return commentLikes.value.some(
      like => like.commentId === commentId && like.userId === userId
    )
  }
  
  // 获取数据统计信息
  const getStatistics = () => {
    const totalNews = news.value.length
    const totalVotes = votes.value.length
    const totalComments = votes.value.filter(v => v.comment || v.imageUrl).length
    const totalNewsLikes = Object.values(likesByNews.value).reduce((sum, count) => sum + count, 0)
    const totalCommentLikes = commentLikes.value.length
    
    // 按新闻类型统计
    const newsByStatus: Record<NewsStatus, number> = {
      'Fake': 0,
      'Not Fake': 0,
      'Undecided': 0
    }
    
    news.value.forEach(n => {
      const status = getStatus(n.id)
      newsByStatus[status]++
    })
    
    // 统计热门新闻（点赞数最多的前5个）
    const hotNews = news.value
      .map(n => ({
        id: n.id,
        title: n.title,
        likes: getLikes(n.id),
        comments: getComments(n.id).length
      }))
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5)
    
    return {
      totalNews,
      totalVotes,
      totalComments,
      totalNewsLikes,
      totalCommentLikes,
      newsByStatus,
      hotNews,
      commentLikeRatio: totalComments > 0 ? (totalCommentLikes / totalComments) : 0
    }
  }
  
  // 创建统一的状态对象，便于管理和访问
  const state = reactive({
    // 计算属性形式的getter，确保返回正确的响应式数据
    get news() { return news.value as News[] },
    get votes() { return votes.value },
    get likesByNews() { return likesByNews.value },
    get commentLikes() { return commentLikes.value },
    get progressActive() { return progressActive.value },
    get progressValue() { return progressValue.value }
  })

  // 返回状态管理对象，遵循Vue的组合式API设计模式
  return {
    // 统一的状态对象
    state,
    
    // 直接暴露状态引用以保持向后兼容
    news,
    votes,
    likesByNews,
    progressActive,
    progressValue,
    
    // 操作方法
    addNews,
    addNewsImported,
    addVote,
    clearImported,
    removeAllNews,
    addLike,
    removeLike,
    addCommentLike,
    removeCommentLike,
    
    // 查询方法
    getVoteCounts,
    getStatus,
    getComments,
    getLikes,
    getCommentLikesCount,
    hasUserLikedComment,
    getStatistics,
    
    // 工具方法
    startProgress,
    finishProgress,
    boostSeedVotes,
    randomizeEngagement,
    likeNews,
    resetMockData,
    
    // 本地化方法 - 强制返回英文内容
    localize: (n: News): News => {
      // 强制返回英文标题，无论传入的语言参数如何
      if (n.translations?.en && n.translations.en.title) {
        // 如果有完整的英文翻译，使用翻译
        return {
          ...n,
          title: n.translations.en.title,
          summary: n.translations.en.summary,
          content: n.translations.en.content,
          reporter: n.translations.en.reporter || n.reporter,
          source: n.translations.en.source || n.source
        }
      } else {
        // 如果没有完整的英文翻译，生成一个默认的英文标题
        return {
          ...n,
          title: `News Report ${n.id}`,
          summary: `Summary for news ${n.id}`,
          content: `Content for news ${n.id}`,
        }
      }
    },
  }
}

export function useStore() {
  const store = inject<ReturnType<typeof createStore>>(StoreSymbol)
  if (!store) throw new Error('useStore must be used within app with Store provided')
  return store
}