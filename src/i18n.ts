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
    nav_report: "报料新闻",
    nav_import: "RSS导入",
    all: "全部",
    fake: "假新闻",
    not_fake: "非假新闻",
    status_fake: "假",
    status_not_fake: "非假",
    status_undecided: "未定",
    perPage: "每页显示",
    items: "条",
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

    voteResults: "投票结果：",
    fakeShort: "假",
    notFakeShort: "非假",
    realNews: "真实新闻",
    fakeNews: "假新闻",
    goVoteAddComment: "去投票/添加评论",
    goVote: "去投票",
    addComment: "添加评论",
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

    reportTitle: "标题",
    reportSummary: "摘要",
    reportContent: "正文",
    reportReporter: "记者",
    reportImageUrl: "图片链接（可选）",
    reportSubmit: "提交报料",
    reportValidationAlert: "请填写标题、摘要、正文与记者姓名",
  },
  en: {
    brand: "Social Anti-Fake News",
    nav_home: "Home",
    nav_report: "Report",
    nav_import: "Import RSS",
    all: "All",
    fake: "Fake",
    not_fake: "Not Fake",
    status_fake: "Fake",
    status_not_fake: "Not Fake",
    status_undecided: "Undecided",
    perPage: "Per page",
    items: "items",
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

    voteResults: "Vote results:",
    fakeShort: "Fake",
    notFakeShort: "Not Fake",
    realNews: "Real News",
    fakeNews: "Fake News",
    goVoteAddComment: "Go Vote / Add Comment",
    goVote: "Go Vote",
    addComment: "Add Comment",
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

    reportTitle: "Title",
    reportSummary: "Summary",
    reportContent: "Content",
    reportReporter: "Reporter",
    reportImageUrl: "Image URL (optional)",
    reportSubmit: "Submit",
    reportValidationAlert: "Please fill title, summary, content and reporter",
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
  const t = (key: DictKey, params?: Record<string, string | number>): string => {
    try {
      // 获取当前语言的字典表
      const table = dict[lang.value] as Record<DictKey, string>
      
      // 获取原始文本
      const raw = table[key]
      
      // 如果键不存在，返回键本身并记录警告
      if (raw === undefined) {
        console.warn(`翻译键不存在: ${key} (语言: ${lang.value})`)
        return key
      }
      
      // 如果没有参数，直接返回原始文本
      if (!params) return raw
      
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
  const getDict = (): Record<DictKey, string> => {
    return dict[lang.value] as Record<DictKey, string>
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