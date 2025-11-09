import { inject, ref } from 'vue'

/**
 * 支持的语言类型
 */
export type UILang = 'zh' | 'en'

/**
 * 国际化字典对象
 */
const dict = {
  zh: {
    brand: "Social Anti-Fake News",
    nav_home: "首页",
    nav_import: "导入",
    nav_statistics: "数据统计",
    nav_report: "举报",
    // RSS导入页面
    importRss_title: 'RSS导入',
    importRss_importNews: '导入新闻',
    importRss_rssUrl: 'RSS链接',
    importRss_submit: '提交',
    importRss_importing: '导入中...',
    importRss_success: '导入成功！',
    importRss_error: '导入失败，请检查RSS链接',
    importRss_pleaseEnterUrl: '请输入RSS链接',
    // 通知相关
    importingRSS: '正在获取RSS内容...',
    importSuccess: '成功导入{count}条新闻',
    importFailed: '导入失败',
    noContentFound: '未找到可导入的内容',
    all: "全部",
    fake: "假新闻",
    not_fake: "非假新闻",
    status_fake: "假",
    status_not_fake: "非假",
    status_undecided: "未定",
    itemsPerPage: "每页显示",
    columnsPerRow: "每行显示",
    search: "搜索",
    searchPlaceholder: "输入关键词搜索...",
    perPage: "每页显示",
    items: "条",
    perRow: "每行显示",
    columns: "列",
    like: "点赞",
    liked: "已点赞",
    likesCount: "{count} 赞",
    reportButton: "+ 报料新闻",
    clearImported: "清空导入新闻",
    confirmClearImported: "确定只清空导入的新闻？本地投票与评论保留。",
    boostVotes: "补充示例投票（约20/条）",
    confirmBoostVotes: "为预设新闻补充投票至约20条/条？不影响导入新闻。",
    autoEngage: "随机点赞/投票/评论",
    confirmAutoEngage: "为所有新闻添加随机点赞、投票和评论？",
    details: "详情",
    vote: "投票/评论",
    page: "第 {page} / {total} 页， 共 {count} 条",
    prev: "上一页",
    next: "下一页",
    noMatch: "暂无符合筛选的新闻",
    language: "语言",
    zh: "中文",
    en: "英文",
    reporter: "记者",
    date: "时间",
    source: "来源",
    countries: "国家",
    peopleVoted: "人已投票",
    notFound: "该新闻不存在。",
    backHome: "返回首页",
    pageNotFound: "404 - 页面未找到",
    pageNotFoundMessage: "抱歉，您访问的页面不存在或已被移除。",
    goHome: "返回首页",
    goBack: "返回上一页",

    voteResults: "投票结果：",
    total_votes: "总投票数",
    fakeShort: "假",
    notFakeShort: "非假",
    voteSubmitted: "投票已提交",
    voteSuccessTitle: "投票成功",
    voteFailed: "投票提交失败，请重试",
    pleaseSelectVote: "请选择投票选项",
    newsNotFound: "新闻不存在",
    notFoundTitle: "未找到",
    loadFailed: "加载失败",
    error: "错误",
    realNews: "真实新闻",
    fakeNews: "假新闻",
    goVoteAddComment: "去投票/添加评论",
    goVote: "去投票",
    addComment: "添加评论",
    enterComment: "请输入您的评论...",
    optionalImageUrl: "可选，提供图片链接以支持您的评论",
    newsStatus: "您认为这条新闻是",
    submitComment: "提交评论",
    viewOriginal: "查看原文",
    voteQuestion: "你认为这条新闻是假的吗？",
    commentsTitle: "评论列表",
    noComments: "暂无评论，欢迎发表观点！",
    anonymous: "匿名",

    votePageTitle: "为 \"{title}\" 投票与评论",
    yourJudgement: "你的判断：",
    fakeOption: "假新闻",
    notFakeOption: "非假新闻",
    yourComment: "你的评论：",
    imageUrl: "图片链接（可选）：",
    yourName: "你的名字（可选）：",
    submit: "提交",
    backToDetail: "返回详情",

    reportTitle: "举报新闻",
    reportSummary: "新闻摘要",
    reportContent: "新闻内容",
    reportReporter: "记者",
    reportImageUrl: "图片链接",
    reportValidationAlert: "请填写所有必填字段",
    reportSuccess: "举报成功！感谢您的反馈。",
    reportError: "举报失败，请稍后重试。",
    reportReason: "举报原因",
    reportSubmit: "提交举报",
    reportBackHome: "返回首页",
    
    // 数据统计页面
    statistics: {
      title: "数据统计",
      totalNews: "新闻总数",
      totalVotes: "投票总数",
      totalComments: "评论总数",
      totalNewsLikes: "新闻点赞总数",
      totalCommentLikes: "评论点赞总数",
      commentLikeRatio: "评论点赞率",
      newsByStatus: "新闻状态分布",
      fakeNews: "假新闻",
      notFakeNews: "真实新闻",
      undecidedNews: "未确定",
      hotNews: "热门新闻 TOP 5",
      noData: "暂无数据",
      commentLikeAnalysis: "评论点赞分析",
      likesPerComment: "平均每评论点赞数",
      averageLikesPerComment: "平均每个评论获得的点赞数",
      engagementRate: "平均互动率",
      averageEngagementPerNews: "平均每篇新闻的互动数"
    }
  },
  en: {
    brand: "Social Anti-Fake News",
    nav_home: "Home",
    nav_import: "Import",
    nav_statistics: "Statistics",
    nav_report: "Report",
    // RSS导入页面
    importRss_title: 'Import RSS',
    importRss_importNews: 'Import News',
    importRss_rssUrl: 'RSS URL',
    importRss_submit: 'Submit',
    importRss_importing: 'Importing...',
    importRss_success: 'Import successful!',
    importRss_error: 'Import failed, please check the RSS URL',
    importRss_pleaseEnterUrl: 'Please enter an RSS URL',
    // 通知相关
    importingRSS: 'Fetching RSS content...',
    importSuccess: 'Successfully imported {count} news items',
    importFailed: 'Import failed',
    noContentFound: 'No content found to import',
    all: "All",
    fake: "Fake News",
    not_fake: "Not Fake News",
    status_fake: "Fake",
    status_not_fake: "Not Fake",
    status_undecided: "Undecided",
    itemsPerPage: "Items per page",
    columnsPerRow: "Columns per row",
    search: "Search",
    searchPlaceholder: "Enter keywords to search...",
    perPage: "Per page",
    items: "items",
    perRow: "Per row",
    columns: "columns",
    like: "Like",
    liked: "Liked",
    likesCount: "{count} likes",
    reportButton: "+ Report News",
    clearImported: "Clear Imported News",
    confirmClearImported: "Clear only imported news? Local votes/comments retained.",
    boostVotes: "Boost Seed Votes (~20 each)",
    confirmBoostVotes: "Boost votes for seeded news to ~20 each? Imported unaffected.",
    autoEngage: "Auto random likes/votes/comments",
    confirmAutoEngage: "Add random likes, votes and comments to all news?",
    details: "Details",
    vote: "Vote/Comment",
    page: "Page {page} / {total}, total {count}",
    prev: "Prev",
    next: "Next",
    noMatch: "No news matches the filter",
    language: "Language",
    zh: "Chinese",
    en: "English",
    reporter: "Reporter",
    date: "Date",
    source: "Source",
    countries: "Countries",
    peopleVoted: "people voted",
    notFound: "News not found.",
    backHome: "Back to Home",
    pageNotFound: "404 - Page Not Found",
    pageNotFoundMessage: "Sorry, the page you are looking for does not exist or has been removed.",
    goHome: "Go Home",
    goBack: "Go Back",

    voteResults: "Vote results:",
    total_votes: "Total Votes",
    fakeShort: "Fake",
    notFakeShort: "Not Fake",
    voteSubmitted: "Vote submitted",
    voteSuccessTitle: "Vote Successful",
    voteFailed: "Vote submission failed, please try again",
    pleaseSelectVote: "Please select a vote option",
    newsNotFound: "News not found",
    notFoundTitle: "Not Found",
    loadFailed: "Failed to load",
    error: "Error",
    realNews: "Real News",
    fakeNews: "Fake News",
    goVoteAddComment: "Go Vote / Add Comment",
    goVote: "Go Vote",
    addComment: "Add Comment",
    enterComment: "Enter your comment...",
    optionalImageUrl: "Optional, provide an image URL to support your comment",
    newsStatus: "Do you think this news is",
    submitComment: "Submit Comment",
    viewOriginal: "View Original",
    voteQuestion: "Do you think this news is fake?",
    commentsTitle: "Comments",
    noComments: "No comments yet. Share your thoughts!",
    anonymous: "Anonymous",

    votePageTitle: "Vote & Comment for \"{title}\"",
    yourJudgement: "Your judgement:",
    fakeOption: "Fake",
    notFakeOption: "Not Fake",
    yourComment: "Your comment:",
    imageUrl: "Image URL (optional):",
    yourName: "Your name (optional):",
    submit: "Submit",
    backToDetail: "Back to Detail",

    reportTitle: "Report News",
    reportSummary: "News Summary",
    reportContent: "News Content",
    reportReporter: "Reporter",
    reportImageUrl: "Image URL",
    reportValidationAlert: "Please fill in all required fields",
    reportSuccess: "Reported successfully! Thank you for your feedback.",
    reportError: "Failed to report, please try again later.",
    reportReason: "Report Reason",
    reportSubmit: "Submit Report",
    reportBackHome: "Back to Home",
    
    // 数据统计页面
    statistics: {
      title: "Statistics",
      totalNews: "Total News",
      totalVotes: "Total Votes",
      totalComments: "Total Comments",
      totalNewsLikes: "Total News Likes",
      totalCommentLikes: "Total Comment Likes",
      commentLikeRatio: "Comment Like Rate",
      newsByStatus: "News Status Distribution",
      fakeNews: "Fake News",
      notFakeNews: "Real News",
      undecidedNews: "Undecided",
      hotNews: "Hot News TOP 5",
      noData: "No Data",
      commentLikeAnalysis: "Comment Like Analysis",
      likesPerComment: "Avg Likes Per Comment",
      averageLikesPerComment: "Average likes per comment",
      engagementRate: "Avg Engagement Rate",
      averageEngagementPerNews: "Average engagement per news"
    }
  }
} as const

/**
 * 字典键类型，从中文字典中提取所有键
 */
export type DictKey = keyof typeof dict['zh']

/**
 * 国际化符号，用于在Vue应用中提供和注入国际化实例
 */
export const I18nSymbol = Symbol('i18n')

/**
 * 国际化实例接口
 */
interface I18nInstance {
  /** 当前语言 */
  lang: { value: UILang }
  /** 翻译函数 */
  t: (key: DictKey, params?: Record<string, string | number>) => string
  /** 设置语言函数 */
  setLang: (lang: UILang) => void
  /** 可用语言列表 */
  availableLangs: UILang[]
  /** 获取当前字典 */
  getDict: () => Record<DictKey, string>
}

/**
 * 创建国际化实例
 * @returns 国际化实例对象
 */
export function createI18n(): I18nInstance {
  // 当前使用的语言 - 强制使用英文作为默认语言
  const lang = ref<UILang>('en')
  
  // 可用语言列表
  const availableLangs: UILang[] = ['zh', 'en']

  /**
   * 翻译函数，支持参数替换
   * @param key 翻译键
   * @param params 可选参数对象
   * @returns 翻译后的文本
   */
  const t = (key: string, params?: Record<string, string | number>): string => {
    try {
      // 获取当前语言的字典表
      let current: any = dict[lang.value]
      
      // 处理嵌套键路径
      const keys = key.split('.')
      let raw: string | undefined
      
      for (const k of keys) {
        if (current === undefined || current[k] === undefined) {
          console.warn(`翻译键不存在: ${key} (语言: ${lang.value})`)
          return key
        }
        
        // 如果是最后一个键，应该是字符串
        if (k === keys[keys.length - 1]) {
          if (typeof current[k] !== 'string') {
            console.warn(`翻译键不是字符串: ${key} (语言: ${lang.value})`)
            return key
          }
          raw = current[k]
        } else {
          current = current[k]
        }
      }
      
      // 如果没有参数，直接返回原始文本
      if (!params || !raw) return raw || key
      
      // 执行参数替换
      return raw.replace(/\{(\w+)\}/g, (_, k) => {
        const value = params[k]
        if (value === undefined) {
          console.warn(`翻译参数缺失: ${k} (键: ${key})`)
          return `{${k}}`
        }
        return String(value)
      })
    } catch (error) {
      console.error(`翻译失败: ${key}`, error)
      return key
    }
  }

  /**
   * 设置当前语言
   * @param l 语言代码
   */
  const setLang = (l: UILang): void => {
    try {
      if (availableLangs.includes(l)) {
        lang.value = l
        console.log(`语言已切换为: ${l}`)
        
        // 可选：将语言设置保存到本地存储
        try {
          localStorage.setItem('ui_language', l)
        } catch (error) {
          console.warn('无法保存语言设置到本地存储:', error)
        }
      } else {
        console.warn(`不支持的语言: ${l}`)
      }
    } catch (error) {
      console.error(`设置语言失败: ${l}`, error)
    }
  }

  /**
   * 获取当前语言的字典
   * @returns 当前语言的字典对象
   */
  const getDict = (): Record<string, any> => {
    return dict[lang.value] as Record<string, any>
  }

  // 返回完整的国际化实例
  return {
    lang,
    t,
    setLang,
    availableLangs,
    getDict
  }
}

/**
 * 组合式API钩子：使用国际化功能
 * @returns 国际化实例
 * @throws 当没有提供I18n实例时抛出错误
 */
export function useI18n(): I18nInstance {
  const i18n = inject<I18nInstance>(I18nSymbol)
  if (!i18n) {
    throw new Error('useI18n必须在已提供I18n的应用内使用')
  }
  return i18n
}