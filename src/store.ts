/**
 * 新闻反假平台状态管理模块
 */
import { inject, ref, reactive } from 'vue'
import type { News, Vote, VoteCounts, NewsStatus, VoteChoice } from './types'

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
 * 内部新闻类型，扩展了原始新闻类型以标记种子和导入的新闻
 */
type InternalNews = News & { __seed?: boolean; __imported?: boolean }

/**
 * 生成列表中下一个可用ID
 * @param list 包含ID属性的对象列表
 * @returns 下一个可用的ID
 */
function nextId(list: { id: number }[]): number {
  return list.length === 0 ? 1 : Math.max(...list.map((x) => x.id)) + 1
}

/**
 * 生成唯一的投票ID
 * @returns 随机生成的投票ID
 */
function genVoteId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

/**
 * 创建种子新闻数据
 * @returns 种子新闻数组
 */
function createSeedNews(): InternalNews[] {
  const total = 60
  const list: InternalNews[] = []
  const now = Date.now()
  
  // 新闻类型定义
  const newsTypes = [
    { type: 'politics', label: '政治', weight: 0.25 },
    { type: 'technology', label: '科技', weight: 0.25 },
    { type: 'culture', label: '文化', weight: 0.2 },
    { type: 'weather', label: '天气', weight: 0.15 },
    { type: 'economy', label: '经济', weight: 0.15 }
  ]
  
  // 国内政治主题
  const politicsDomesticSubjects = [
    '国务院', '全国人大常委会', '中央政治局', '外交部', 
    '最高人民法院', '最高人民检察院', '国家发改委', '财政部',
    '公安部', '教育部', '科技部', '生态环境部',
    '各省省政府', '香港特区政府', '澳门特区政府', '中国人民解放军'
  ]
  
  // 国际政治主题
  const politicsInternationalSubjects = [
    '美国总统', '美国国会', '欧盟委员会', '联合国安理会',
    '俄罗斯政府', '英国政府', '法国总统', '德国总理',
    '日本首相', '韩国总统', '朝鲜领导人', '印度总理',
    '中东和谈', '北约峰会', 'G20峰会', '联合国大会'
  ]
  
  // 科技主题
  const technologySubjects = [
    '人工智能研究团队', '量子计算实验室', '航天科技集团', '新能源汽车制造商',
    '5G技术联盟', '半导体产业', '大数据研究中心', '云计算服务提供商',
    '元宇宙研发团队', '区块链技术公司', '生物科技实验室', '无人机研发中心',
    '智能机器人研究小组', '可穿戴设备厂商', 'AR/VR技术公司', '绿色科技企业'
  ]
  
  // 文化主题
  const cultureSubjects = [
    '国家博物馆', '故宫博物院', '中央芭蕾舞团', '国家话剧院',
    '中国作家协会', '国际电影节', '世界文化遗产委员会', '传统艺术节',
    '民族音乐团体', '现代艺术展览', '文学奖评选委员会', '考古发掘团队',
    '非物质文化遗产保护中心', '文化交流协会', '影视制作公司', '出版集团'
  ]
  
  // 天气主题
  const weatherSubjects = [
    '国家气象局', '中国气象局', '台风预警中心', '暴雨监测站',
    '高温预警部门', '寒潮预报中心', '沙尘暴监测网络', '雷电防护中心',
    '空气质量监测站', '气候变化研究中心', '防洪抗旱指挥部', '地质灾害预警系统',
    '极端天气应急响应小组', '气象卫星中心', '农业气象服务', '城市气象研究团队'
  ]
  
  // 经济主题
  const economySubjects = [
    '中国人民银行', '中国银保监会', '中国证监会', '财政部',
    '国家统计局', '世界银行', '国际货币基金组织', '亚洲开发银行',
    '大型国企', '跨国公司', '金融市场监管机构', '国际贸易组织',
    '房地产市场研究中心', '股市分析机构', '投资银行', '经济研究智库'
  ]
  
  // 动作列表 - 按类型分组
  const actions = {
    politics: [
      '发布重要政策', '召开高层会议', '签署合作协议', '发表重要讲话',
      '提出新法案', '举行外交会谈', '回应国际关切', '调整外交政策',
      '部署重要改革', '宣布人事任命', '启动特别调查', '通过重大决议',
      '举办国际峰会', '发布外交声明', '应对国际危机', '推动区域合作'
    ],
    technology: [
      '发布重大科技成果', '研发新技术', '推出创新产品', '突破技术瓶颈',
      '成立联合实验室', '获得重大专利', '发布行业标准', '完成技术升级',
      '举办科技展览', '开展国际合作', '投资研发项目', '应用新技术',
      '宣布技术路线图', '解决关键技术难题', '发布研究报告', '获得科技奖项'
    ],
    culture: [
      '举办文化节', '开展国际交流', '发布艺术作品', '举行文化遗产保护活动',
      '举办艺术节', '出版文学作品', '举办体育赛事', '进行文化产业投资',
      '开展学术研讨', '举办国际电影展', '举办音乐会', '推出文化品牌',
      '启动文化工程', '组织文化论坛', '举办艺术展览', '设立文化奖项'
    ],
    weather: [
      '发布天气预报', '发出灾害预警', '启动应急响应', '监测极端天气',
      '发布高温预警', '发布暴雨预警', '发布台风预警', '发布寒潮预警',
      '评估灾害影响', '提供气象服务', '研究气候变化', '发布空气质量报告',
      '开展气象科普', '预测天气趋势', '更新气象数据', '分析气象灾害'
    ],
    economy: [
      '发布经济数据', '调整货币政策', '推出经济计划', '公布财政预算',
      '发布行业报告', '调整利率政策', '吸引投资', '促进贸易合作',
      '应对市场波动', '发布消费指数', '优化营商环境', '推动经济转型',
      '评估经济形势', '推出刺激政策', '发布就业数据', '应对通胀压力'
    ]
  }
  
  // 新闻来源 - 国内外知名媒体
  const sources = {
    domestic: [
      '人民日报', '新华社', '中央电视台', '光明日报',
      '经济日报', '中国日报', '科技日报', '中国青年报',
      '环球时报', '法制日报', '澎湃新闻', '界面新闻',
      '财新网', '凤凰网', '南方周末', '第一财经'
    ],
    international: [
      '路透社', '美联社', '法新社', '彭博社',
      '华尔街日报', '金融时报', '纽约时报', '华盛顿邮报',
      '卫报', '经济学人', 'BBC新闻', 'CNN',
      'NHK', '半岛电视台', '今日俄罗斯', '亚洲新闻台'
    ]
  }
  
  // 图片类别 - 与新闻类型相关
  const imageCategories = {
    politics: ['government', 'leaders', 'protest', 'meeting', 'flag', 'building'],
    technology: ['tech', 'computer', 'gadget', 'robot', 'internet', 'innovation'],
    culture: ['art', 'music', 'theater', 'dance', 'festival', 'museum'],
    weather: ['rain', 'snow', 'storm', 'sun', 'cloud', 'temperature'],
    economy: ['money', 'stock', 'business', 'bank', 'trade', 'market']
  }
  
  // 获取随机主题
  const getRandomSubject = (type: string): string => {
    switch (type) {
      case 'politics':
        return Math.random() < 0.6 ? 
          politicsDomesticSubjects[Math.floor(Math.random() * politicsDomesticSubjects.length)] :
          politicsInternationalSubjects[Math.floor(Math.random() * politicsInternationalSubjects.length)]
      case 'technology':
        return technologySubjects[Math.floor(Math.random() * technologySubjects.length)]
      case 'culture':
        return cultureSubjects[Math.floor(Math.random() * cultureSubjects.length)]
      case 'weather':
        return weatherSubjects[Math.floor(Math.random() * weatherSubjects.length)]
      case 'economy':
        return economySubjects[Math.floor(Math.random() * economySubjects.length)]
      default:
        return ''
    }
  }
  
  // 获取随机图片
  const getRandomImageUrl = (type: string, id: number): string => {
    const categories = imageCategories[type as keyof typeof imageCategories] || ['news']
    const category = categories[Math.floor(Math.random() * categories.length)]
    
    // 使用与新闻类型和内容相关的图片源
    // 这里使用不同的图片API和种子来确保图片多样性和相关性
    const randomSeed = `${type}-${category}-${id}-${Math.floor(Math.random() * 1000)}`
    return `https://picsum.photos/seed/${randomSeed}/960/540`
  }
  
  // 获取随机来源
  const getRandomSource = (isInternational: boolean): string => {
    const sourcePool = isInternational ? sources.international : sources.domestic
    return sourcePool[Math.floor(Math.random() * sourcePool.length)]
  }
  
  // 内容模板 - 按新闻类型区分
  const contentTemplates = {
    politics: {
      zh: (subject: string, action: string) => `${subject}近日${action}，引发国内外广泛关注。相关专家分析认为，此举将对国际关系和地区稳定产生深远影响。在记者招待会上，发言人表示将继续推进相关工作，维护国家利益和国际和平。`,
      en: (subject: string, action: string) => `${subject} recently ${action}, attracting widespread attention both domestically and internationally. Relevant experts analyze that this move will have a profound impact on international relations and regional stability. At a press conference, the spokesperson stated that efforts will continue to advance related work and safeguard national interests and international peace.`
    },
    technology: {
      zh: (subject: string, action: string) => `${subject}成功${action}，标志着相关领域取得重大突破。该技术的应用将极大提升生产效率，改善人们生活质量。研究团队表示，这一成果凝聚了多年心血，未来将继续深化研究。`,
      en: (subject: string, action: string) => `${subject} successfully ${action}, marking a major breakthrough in related fields. The application of this technology will greatly enhance production efficiency and improve people's quality of life. The research team stated that this achievement represents years of hard work, and they will continue to deepen their research in the future.`
    },
    culture: {
      zh: (subject: string, action: string) => `${subject}即将${action}，为观众带来一场文化盛宴。活动旨在弘扬传统文化，促进文化交流，增强文化自信。主办方透露，此次活动筹备已久，将呈现多个精彩节目。`,
      en: (subject: string, action: string) => `${subject} will soon ${action}, bringing a cultural feast to the audience. The event aims to promote traditional culture, facilitate cultural exchanges, and enhance cultural confidence. Organizers revealed that this event has been in preparation for a long time and will feature several wonderful performances.`
    },
    weather: {
      zh: (subject: string, action: string) => `${subject}今日${action}，提醒市民注意防范。预计未来几天天气将持续变化，相关部门已启动应急预案。气象专家建议，公众应密切关注天气变化，做好防护措施。`,
      en: (subject: string, action: string) => `${subject} today ${action}, reminding citizens to take precautions. Weather is expected to continue changing in the next few days, and relevant departments have activated emergency plans. Meteorological experts suggest that the public should pay close attention to weather changes and take protective measures.`
    },
    economy: {
      zh: (subject: string, action: string) => `${subject}最新${action}显示，经济运行总体平稳向好。分析指出，多项经济指标出现积极变化，市场信心逐步恢复。业内人士预计，未来经济增长将保持韧性，为高质量发展奠定基础。`,
      en: (subject: string, action: string) => `${subject}'s latest ${action} shows that the overall economic operation is stable and improving. Analysis points out that multiple economic indicators have shown positive changes, and market confidence is gradually recovering. Industry insiders expect economic growth to remain resilient in the future, laying a foundation for high-quality development.`
    }
  }
  
  // 按权重随机选择新闻类型
  const getRandomNewsType = () => {
    const r = Math.random()
    let cumulativeWeight = 0
    
    for (const type of newsTypes) {
      cumulativeWeight += type.weight
      if (r < cumulativeWeight) {
        return type.type
      }
    }
    
    return newsTypes[0].type // 默认返回第一种类型
  }
  
  // 生成示例新闻数据
  for (let i = 0; i < total; i += 1) {
    const id = i + 1
    const createdAt = new Date(now - i * 3600_000).toISOString() // 按小时错开
    const newsType = getRandomNewsType()
    const isInternational = newsType === 'politics' && Math.random() > 0.4
    
    // 获取主题、动作和模板
    const sbj = getRandomSubject(newsType)
    const typeActions = actions[newsType as keyof typeof actions]
    const act = typeActions[Math.floor(Math.random() * typeActions.length)]
    const template = contentTemplates[newsType as keyof typeof contentTemplates]
    
    // 英文内容
    const enSubject = translateSubjectToEnglish(sbj)
    const enAction = translateActionToEnglish(act)
    const enTitle = `${enSubject} ${enAction}`
    const enSummary = `${enSubject} ${enAction}. This development has significant implications for various sectors.`
    const enContent = template.en(enSubject, enAction)
    const enReporter = `Reporter ${String.fromCharCode(65 + (i % 26))}`
    
    // 中文内容 (完全移除未使用的变量)
    // 移除所有未使用的中文内容变量
    // const zhTitle = enTitle
    // const zhSummary = `${sbj}${act}，引发社会各界广泛关注。`
    // const zhContent = template.zh(sbj, act)
    
    // 获取来源和图片
    const source = getRandomSource(isInternational)
    const imageUrl = getRandomImageUrl(newsType, id)
    
    list.push({
      id,
      title: enTitle, // 直接使用英文标题作为主标题
      summary: enSummary, // 直接使用英文摘要
      content: enContent, // 直接使用英文内容
      reporter: enReporter, // 直接使用英文记者名
      createdAt,
      imageUrl,
      source: translateSourceToEnglish(source), // 直接使用英文来源
      link: `https://example.com/news/${id}`,
      translations: { 
        en: { 
          title: enTitle, 
          summary: enSummary, 
          content: enContent, 
          reporter: enReporter, 
          source: translateSourceToEnglish(source) 
        } 
      },
      __seed: true,
    })
  }
  
  return list
}

// 辅助函数：将中文主题翻译为英文
function translateSubjectToEnglish(subject: string): string {
  const translations: Record<string, string> = {
    '市政府': 'City Government',
    '国家发改委': 'National Development and Reform Commission',
    '科技巨头': 'Tech Giant',
    '研究团队': 'Research Team',
    '市公安局': 'City Police Bureau',
    '卫生健康委员会': 'Health Commission',
    '教育局': 'Education Bureau',
    '中央银行': 'Central Bank',
    '气象局': 'Meteorological Bureau',
    '国家足球队': 'National Football Team',
    '能源公司': 'Energy Company',
    '交通运输部': 'Ministry of Transport',
    '北京大学': 'Peking University',
    '旅游局': 'Tourism Bureau',
    '房地产市场': 'Real Estate Market',
    '环保组织': 'Environmental Organization',
    '食品监督局': 'Food Supervision Bureau',
    '创业公司': 'Startup Company',
    '电商平台': 'E-commerce Platform',
    '三甲医院': 'Top Hospital',
    '社区委员会': 'Community Committee',
    '国际机场': 'International Airport',
    '高铁集团': 'High-Speed Railway Group',
    '电信运营商': 'Telecom Operator',
    '农业农村部': 'Ministry of Agriculture and Rural Affairs'
  }
  return translations[subject] || subject
}

// 辅助函数：将中文动作翻译为英文
function translateActionToEnglish(action: string): string {
  const translations: Record<string, string> = {
    '发布重要政策': 'Releases Important Policy',
    '启动紧急预案': 'Activates Emergency Plan',
    '遭遇网络攻击': 'Suffers Cyber Attack',
    '宣布重大投资': 'Announces Major Investment',
    '开展专项调查': 'Launches Special Investigation',
    '发布研究报告': 'Releases Research Report',
    '调整收费标准': 'Adjusts Fee Standards',
    '通过年度预算': 'Approves Annual Budget',
    '回应社会关切': 'Responds to Public Concerns',
    '召回问题产品': 'Recalls Defective Products',
    '举行抗议活动': 'Holds Protest Activities',
    '报告系统故障': 'Reports System Failure',
    '更新行业规范': 'Updates Industry Standards',
    '暂停服务升级': 'Suspends Service Upgrade',
    '调整价格策略': 'Adjusts Pricing Strategy',
    '降低贷款利率': 'Lowers Loan Interest Rates',
    '扩大援助计划': 'Expands Assistance Program',
    '面临法律诉讼': 'Faces Legal Lawsuit',
    '获得融资支持': 'Secures Financing Support',
    '提醒防范诈骗': 'Warns Against Frauds',
    '推动改革创新': 'Promotes Reform and Innovation',
    '迎来需求高峰': 'Experiences Demand Peak',
    '遭遇业绩下滑': 'Experiences Performance Decline',
    '创造营收记录': 'Creates Revenue Record',
    '测试新系统': 'Tests New System'
  }
  return translations[action] || action
}

// 辅助函数：将中文新闻来源翻译为英文
function translateSourceToEnglish(source: string): string {
  const translations: Record<string, string> = {
    '人民日报': 'People\'s Daily',
    '新华社': 'Xinhua News Agency',
    '中央电视台': 'CCTV',
    '澎湃新闻': 'The Paper',
    '健康时报': 'Health Times',
    '财经日报': 'Financial Daily',
    '环境观察': 'Environmental Observer',
    '科技日报': 'Science and Technology Daily',
    '中国青年报': 'China Youth Daily',
    '环球时报': 'Global Times',
    '法制日报': 'Legal Daily',
    '经济观察报': 'Economic Observer'
  }
  return translations[source] || source
}

/**
 * 创建全局状态管理实例
 * @returns 状态管理对象
 */
export function createStore() {
  // 状态初始化
  const news = ref<InternalNews[]>(createSeedNews())
  
  /**
   * 从本地存储初始化投票数据
   * @returns 验证后的投票数组
   */
  const initVotes = (): Vote[] => {
    try {
      const raw = localStorage.getItem('votes')
      const parsed = raw ? JSON.parse(raw) as Vote[] : []
      
      // 数据验证：确保数组元素包含必要字段
      if (Array.isArray(parsed)) {
        return parsed.filter((v) => 
          typeof (v as any).newsId === 'number' && 
          ['fake', 'not_fake'].includes((v as any).choice)
        )
      }
      return []
    } catch (error) {
      console.warn('初始化投票数据失败:', error)
      return []
    }
  }
  
  const votes = ref<Vote[]>(initVotes())
  
  /**
   * 从本地存储初始化点赞数据
   * @returns 点赞记录对象
   */
  const initLikes = (): Record<number, number> => {
    try {
      const raw = localStorage.getItem('likes_by_news')
      const parsed = raw ? JSON.parse(raw) : {}
      
      // 确保返回有效的记录对象
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed
      }
      return {}
    } catch (error) {
      console.warn('初始化点赞数据失败:', error)
      return {}
    }
  }
  
  const likesByNews = ref<Record<number, number>>(initLikes())

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
    let fake = 0, not_fake = 0
    
    for (const v of votes.value) {
      if (v.newsId !== newsId) continue
      
      if (v.choice === 'fake') fake += 1
      else if (v.choice === 'not_fake') not_fake += 1
    }
    
    return { fake, not_fake }
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
      const fakeCount = makeFakeMajority ? 14 : 6
      const notFakeCount = makeFakeMajority ? 6 : 14
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
      persistVotes()
      persistLikes()
    } catch (error) {
      console.warn('删除所有新闻失败:', error)
      // 重置到安全状态
      news.value = []
      votes.value = []
      likesByNews.value = {}
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
      
      // 清空投票和点赞数据
      votes.value = []
      likesByNews.value = {}
      
      // 确保有足够的新闻数据用于测试
      if (news.value.length < 60) {
        // 如果当前新闻不足60条，生成新的种子新闻
        news.value = createSeedNews()
      }
      
      // 重新生成种子新闻的投票状态
      primeSeedStatuses()
      boostSeedVotes(18, 24)
      randomizeEngagement({ 
        likeMin: 5, 
        likeMax: 60, 
        voteMin: 8, 
        voteMax: 24, 
        commentRate: 0.35, 
        imageRate: 0.12 
      })
      
      // 持久化重置后的数据
      persistVotes()
      persistLikes()
      
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
  const autoImport = String((import.meta as any).env?.VITE_AUTO_IMPORT_RSS || '').toLowerCase() === 'true'
  // Initialize demo votes to make half of seeds show different statuses
  if (votes.value.length === 0) {
    primeSeedStatuses()
    // Optional randomization to vary counts
    boostSeedVotes(18, 24)
    // Auto random engagement only when no prior votes
    randomizeEngagement({ likeMin: 5, likeMax: 60, voteMin: 8, voteMax: 24, commentRate: 0.35, imageRate: 0.12 })
  }
  // Ensure homepage shows random likes when none exist (without adding votes/comments)
  const hasAnyLikes = () => Object.values(likesByNews.value).some((x) => (typeof x === 'number') && x > 0)
  if (!hasAnyLikes()) {
    randomizeEngagement({ likeMin: 5, likeMax: 60, voteMin: 0, voteMax: 0, commentRate: 0, imageRate: 0 })
  }
  if (autoImport) {
    // Intentionally left as a no-op here to avoid网络错误日志; manual import page handles RSS
  }

  // 为种子新闻添加初始投票，使其看起来更真实
  boostSeedVotes(5, 15)

  // 创建统一的状态对象，便于管理和访问
  const state = reactive({
    // 计算属性形式的getter，确保返回正确的响应式数据
    get news() { return news.value as News[] },
    get votes() { return votes.value },
    get likesByNews() { return likesByNews.value },
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
    
    // 查询方法
    getVoteCounts,
    getStatus,
    getComments,
    getLikes,
    
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