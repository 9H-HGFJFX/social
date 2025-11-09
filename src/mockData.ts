/**
 * 模拟数据生成模块
 * 负责生成新闻、投票等测试数据
 */
import type { News, Vote, CommentLike } from './types'

/**
 * 内部新闻类型，扩展了原始新闻类型以标记种子和导入的新闻
 */
export type InternalNews = News & { __seed?: boolean; __imported?: boolean }

/**
 * 生成列表中下一个可用ID
 * @param list 包含ID属性的对象列表
 * @returns 下一个可用的ID
 */
export function nextId(list: { id: number }[]): number {
  return list.length === 0 ? 1 : Math.max(...list.map((x) => x.id)) + 1
}

/**
 * 生成唯一的投票ID
 * @returns 随机生成的投票ID
 */
export function genVoteId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

/**
 * 将中文主题翻译为英文
 */
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

/**
 * 将中文动作翻译为英文
 */
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

/**
 * 将中文新闻来源翻译为英文
 */
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
 * 创建种子新闻数据
 * @param count 生成新闻的数量
 * @returns 种子新闻数组
 */
export function createSeedNews(count: number = 30): InternalNews[] {
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
  
  // 生成指定数量的新闻
  for (let i = 0; i < count; i += 1) {
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
    
    // 获取来源和图片
    const source = getRandomSource(isInternational)
    const imageUrl = getRandomImageUrl(newsType, id)
    
    list.push({
      id,
      title: enTitle,
      summary: enSummary,
      content: enContent,
      reporter: enReporter,
      createdAt,
      imageUrl,
      source: translateSourceToEnglish(source),
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

/**
 * 为新闻生成初始投票数据
 * @param newsIds 新闻ID数组
 * @param votesPerNews 每条新闻的平均投票数
 * @returns 投票数据数组
 */
export function generateMockVotes(newsIds: number[], votesPerNews: number = 5): Vote[] {
  const votes: Vote[] = []
  const choices: ('fake' | 'not_fake')[] = ['fake', 'not_fake']
  const comments = [
    'This news seems inaccurate based on my research.',
    'Great reporting, very informative.',
    'I\'ve verified this information and it appears to be correct.',
    'There are several factual errors in this article.',
    'Important news that everyone should be aware of.',
    'This story has been manipulated to create controversy.',
    'Well-sourced and well-written piece.',
    'I have serious doubts about the credibility of this news.'
  ]
  
  newsIds.forEach(newsId => {
    // 为每条新闻生成随机数量的投票
    const actualVotes = Math.floor(Math.random() * votesPerNews) + 1
    
    for (let i = 0; i < actualVotes; i++) {
      votes.push({
        id: genVoteId(),
        newsId,
        choice: choices[Math.floor(Math.random() * choices.length)],
        comment: Math.random() > 0.5 ? comments[Math.floor(Math.random() * comments.length)] : undefined,
        voter: `User${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    }
  })
  
  return votes
}

/**
 * 为评论生成初始点赞数据
 * @param commentIds 评论ID数组
 * @returns 评论点赞数据数组
 */
export function generateMockCommentLikes(commentIds: string[]): CommentLike[] {
  const likes: CommentLike[] = []
  
  commentIds.forEach(commentId => {
    // 每条评论有50%的概率获得点赞
    if (Math.random() > 0.5) {
      const likeCount = Math.floor(Math.random() * 10) + 1
      
      for (let i = 0; i < likeCount; i++) {
        likes.push({
          commentId,
          userId: `User${Math.floor(Math.random() * 1000)}`,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        })
      }
    }
  })
  
  return likes
}