import type { News } from "./types";

/**
 * RSS代理函数类型
 */
type ProxyFunction = (url: string) => string;

/**
 * RSS导入选项接口
 */
export interface RSSImportOptions {
  /** 需要导入的新闻数量 */
  count: number;
  /** 添加新闻的回调函数 */
  addNews: (payload: Omit<News, "id" | "createdAt"> & { createdAt?: string }) => void;
  /** 已存在的链接集合，用于去重 */
  existingLinks?: Set<string>;
  /** RSS源列表，默认为预设源 */
  sources?: string[];
}

/**
 * 通过多重代理抓取RSS内容，提升在不同网络环境下的可用性
 * @param url RSS源地址
 * @returns RSS内容的XML文本
 * @throws 当所有代理均不可用时抛出错误
 */
export async function fetchRSS(url: string): Promise<string> {
  // 验证URL格式
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    throw new Error('无效的RSS URL');
  }

  // 代理列表，按优先级排序
  const proxies: ProxyFunction[] = [
    // 主要代理
    (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u: string) => `https://allorigins.hexlet.app/raw?url=${encodeURIComponent(u)}`,
    // 备选代理
    (u: string) => `https://r.jina.ai/http/${u}`,
    // 支持HTTPS和HTTP的代理
    (u: string) => u.startsWith("https://") 
      ? `https://cors.isomorphic-git.org/${u}` 
      : `https://cors.isomorphic-git.org/http://${u.replace(/^http:\/\//, "")}`,
  ];

  const errors: Error[] = [];
  
  // 尝试每个代理直到成功或全部失败
  for (const p of proxies) {
    const target = p(url);
    try {
      // 设置请求控制器和超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12秒超时
      
      // 发送请求
      const res = await fetch(target, { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/xml, text/xml',
          'User-Agent': 'Mozilla/5.0 (Social Anti-Fake News App)'
        }
      });
      
      clearTimeout(timeoutId);
      
      // 检查响应状态
      if (!res.ok) {
        throw new Error(`代理请求失败: HTTP ${res.status} ${target}`);
      }
      
      // 获取响应文本
      const text = await res.text();
      
      // 验证响应内容
      if (!text || text.trim().length === 0) {
        throw new Error(`空响应: ${target}`);
      }
      
      return text;
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      errors.push(error);
      console.debug(`代理 ${target} 失败: ${error.message}`);
      // 继续尝试下一个代理
    }
  }
  
  // 所有代理都失败了，生成详细错误信息
  const errorMessages = errors.map(e => e.message).join(" | ");
  throw new Error(`RSS获取失败（所有代理均不可用）: ${errorMessages}`);
}

/**
 * 从XML文本中解析RSS内容，支持RSS和Atom格式
 * @param xmlText RSS/Atom XML文本
 * @returns 解析后的新闻项目数组
 */
export function parseRSS(xmlText: string): Omit<News, "id">[] {
  try {
    // 检查输入
    if (!xmlText || typeof xmlText !== 'string') {
      throw new Error('无效的XML文本');
    }

    // 解析XML
    const dom = new DOMParser().parseFromString(xmlText, "text/xml");
    
    // 检查解析错误
    const parserError = dom.querySelector("parsererror");
    if (parserError) {
      throw new Error('XML解析错误: ' + parserError.textContent?.trim());
    }

    // 获取频道标题
    const channelTitle = dom.querySelector("channel > title")?.textContent?.trim()
      ?? dom.querySelector("feed > title")?.textContent?.trim()
      ?? undefined;

    // 获取新闻条目节点（支持RSS的<item>与Atom的<entry>）
    const nodes = getNewsItems(dom);
    
    if (nodes.length === 0) {
      console.warn('未找到新闻条目');
      return [];
    }

    return nodes.map((node) => parseNewsItem(node, channelTitle));
  } catch (error) {
    console.error('RSS解析失败:', error);
    throw error;
  }
}

/**
 * 从DOM中获取新闻条目节点
 * @param dom 解析后的XML DOM
 * @returns 新闻条目元素数组
 */
function getNewsItems(dom: Document): Element[] {
  // 优先尝试RSS格式的<item>标签
  const rssItems = Array.from(dom.querySelectorAll("item"));
  if (rssItems.length > 0) {
    return rssItems;
  }
  
  // 然后尝试Atom格式的<entry>标签
  const atomEntries = Array.from(dom.querySelectorAll("entry"));
  return atomEntries;
}

/**
 * 从单个新闻条目节点中解析新闻数据
 * @param node 新闻条目元素
 * @param channelTitle 频道标题（用作作者和来源的回退）
 * @returns 解析后的新闻对象
 */
function parseNewsItem(node: Element, channelTitle?: string): Omit<News, "id"> {
  // 提取标题
  const title = node.querySelector("title")?.textContent?.trim() ?? "(无标题)";

  // 提取描述/内容
  const description = (
    node.querySelector("description")?.textContent ||
    node.querySelector("summary")?.textContent ||
    node.querySelector("content")?.textContent ||
    ""
  ).trim();

  // 提取发布时间
  const createdAt = getFormattedDate(node);

  // 提取链接
  const link = getLink(node);

  // 提取作者
  const author = getAuthor(node, channelTitle);

  // 提取图片URL
  const imageUrl = getImageUrl(node, description);

  // 清理HTML标签生成摘要
  const summary = stripHtml(description);
  
  // 限制内容长度，避免过大
  const limitedContent = summary.length > 1000 
    ? summary.substring(0, 1000) + '...' 
    : summary;

  return {
    title,
    summary,
    content: limitedContent,
    reporter: author,
    createdAt,
    imageUrl,
    source: channelTitle,
    link
  };
}

/**
 * 从新闻条目节点中提取并格式化日期
 * @param node 新闻条目元素
 * @returns ISO格式的日期字符串
 */
function getFormattedDate(node: Element): string {
  // 尝试各种日期字段
  const dateFields = [
    node.querySelector("pubDate"),
    node.querySelector("published"),
    node.querySelector("updated")
  ];
  
  for (const field of dateFields) {
    if (field?.textContent) {
      try {
        const date = new Date(field.textContent);
        if (!isNaN(date.getTime())) {
          return date.toISOString();
        }
      } catch {
        // 继续尝试下一个字段
      }
    }
  }
  
  // 所有日期字段都失败，返回当前时间
  return new Date().toISOString();
}

/**
 * 从新闻条目节点中提取链接
 * @param node 新闻条目元素
 * @returns 链接字符串或undefined
 */
function getLink(node: Element): string | undefined {
  // 尝试普通链接文本
  const link = node.querySelector("link")?.textContent?.trim();
  if (link) return link;
  
  // 尝试Atom格式的链接属性
  const atomLink = (
    node.querySelector('link[rel="alternate"]') || 
    node.querySelector('link')
  )?.getAttribute('href');
  if (atomLink) return atomLink;
  
  // 尝试guid作为链接的回退
  return node.querySelector('guid')?.textContent?.trim();
}

/**
 * 从新闻条目节点中提取作者信息
 * @param node 新闻条目元素
 * @param channelTitle 频道标题（用作回退）
 * @returns 作者字符串
 */
function getAuthor(node: Element, channelTitle?: string): string {
  // 尝试各种作者字段
  const authorFields = [
    node.querySelector("author")?.textContent,
    (node.querySelector("dc\\:creator") as Element | null)?.textContent,
    node.querySelector("author > name")?.textContent,
    channelTitle,
    "RSS"
  ];
  
  for (const field of authorFields) {
    if (field?.trim()) {
      return field.trim();
    }
  }
  
  return "RSS";
}

/**
 * 从新闻条目节点和描述中提取图片URL
 * @param node 新闻条目元素
 * @param description 描述文本
 * @returns 图片URL或undefined
 */
function getImageUrl(node: Element, description: string): string | undefined {
  // 尝试enclosure标签
  const enclosure = node.querySelector("enclosure")?.getAttribute("url");
  if (enclosure) return enclosure;
  
  // 尝试media:content标签
  const mediaContent = (node.querySelector("media\\:content") as Element | null)?.getAttribute("url");
  if (mediaContent) return mediaContent;
  
  // 尝试从HTML描述中提取img标签
  const imgMatch = description.match(/<img[^>]*src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  
  return undefined;
}

/**
 * 从HTML文本中移除标签，生成纯文本
 * @param html HTML文本
 * @returns 清理后的纯文本
 */
function stripHtml(html: string): string {
  if (!html) return '';
  
  // 移除HTML标签
  const plainText = html.replace(/<[^>]+>/g, "");
  
  // 移除多余的空白字符
  return plainText.replace(/\s+/g, ' ').trim();
}

/**
 * 默认RSS源列表，包含中文和国际新闻源
 */
export const DEFAULT_SOURCES = [
  // 中文新闻源（在中国大陆通常可访问）
  "https://36kr.com/feed",               // 36氪（Atom）
  "https://www.ithome.com/rss/",         // IT之家（RSS）
  "https://www.cnbeta.com/backend.php",  // cnBeta（RSS）
  "https://www.solidot.org/index.rss",   // Solidot（RSS）
  "https://www.sspai.com/feed",          // 少数派（RSS）
  "https://www.ifanr.com/feed",          // 爱范儿（RSS）
  // 国际新闻源（作为补充）
  "https://feeds.bbci.co.uk/news/world/rss.xml",
  "https://feeds.reuters.com/reuters/worldNews",
  "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
  "https://www.aljazeera.com/xml/rss/all.xml",
];

/**
 * 从多个RSS源导入新闻条目
 * @param options 导入选项
 * @returns 成功导入的新闻数量
 */
export async function importRSSItems(options: RSSImportOptions): Promise<number> {
  const { count, addNews, existingLinks, sources = DEFAULT_SOURCES } = options;
  
  // 参数验证
  if (typeof count !== 'number' || count <= 0) {
    throw new Error('无效的新闻数量');
  }
  
  if (typeof addNews !== 'function') {
    throw new Error('无效的addNews回调函数');
  }
  
  let added = 0;
  
  // 遍历所有RSS源
  for (const src of sources) {
    if (added >= count) break;
    
    try {
      console.log(`正在导入RSS源: ${src}`);
      
      // 获取并解析RSS内容
      const xml = await fetchRSS(src);
      const items = parseRSS(xml);
      
      // 过滤和添加新闻
      for (const item of items) {
        if (added >= count) break;
        
        // 检查是否已存在相同链接
        if (existingLinks && item.link && existingLinks.has(item.link)) {
          console.debug(`跳过已存在的新闻: ${item.title}`);
          continue;
        }
        
        // 添加新闻
        addNews(item);
        added += 1;
        console.debug(`成功添加新闻: ${item.title}`);
      }
    } catch (e) {
      console.warn(`RSS源导入失败: ${src}`, e);
      // 继续尝试下一个源
    }
  }
  
  console.log(`共成功导入 ${added} 条新闻`);
  return added;
}
