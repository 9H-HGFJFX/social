import { ref } from 'vue'
import type { App } from 'vue'

export type NotificationType = 'error' | 'warning' | 'info' | 'success'

export interface NotificationOptions {
  title?: string
  message: string
  type?: NotificationType
  duration?: number
  showClose?: boolean
}

export interface Notification extends NotificationOptions {
  id: number
}

class NotificationService {
  private notifications = ref<Notification[]>([])
  private nextId = 1

  // 获取通知列表
  getNotifications() {
    return this.notifications
  }

  // 添加通知
  add(options: NotificationOptions) {
    const id = this.nextId++
    const notification: Notification = {
      id,
      type: 'info',
      duration: 3000,
      showClose: true,
      ...options
    }

    this.notifications.value.push(notification)
    return id
  }

  // 移除通知
  remove(id: number) {
    const index = this.notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      this.notifications.value.splice(index, 1)
    }
  }

  // 清除所有通知
  clear() {
    this.notifications.value = []
  }

  // 错误通知
  error(message: string, title?: string) {
    return this.add({
      type: 'error',
      title: title || '错误',
      message,
      duration: 5000
    })
  }

  // 警告通知
  warning(message: string, title?: string) {
    return this.add({
      type: 'warning',
      title: title || '警告',
      message,
      duration: 4000
    })
  }

  // 信息通知
  info(message: string, title?: string) {
    return this.add({
      type: 'info',
      title: title || '信息',
      message,
      duration: 3000
    })
  }

  // 成功通知
  success(message: string, title?: string) {
    return this.add({
      type: 'success',
      title: title || '成功',
      message,
      duration: 3000
    })
  }
}

// 创建单例实例
const notificationService = new NotificationService()

// 创建Vue插件
export const notificationPlugin = {
  install(app: App) {
    // 全局属性
    app.config.globalProperties.$notify = notificationService
    // 提供注入
    app.provide('notificationService', notificationService)
  }
}

// 组合式API函数
export function useNotification() {
  return notificationService
}

export default notificationService