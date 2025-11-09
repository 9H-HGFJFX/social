<template>
  <div 
    class="error-message" 
    :class="{ 
      'error-message--error': type === 'error',
      'error-message--warning': type === 'warning',
      'error-message--info': type === 'info',
      'error-message--success': type === 'success',
      'error-message--visible': visible
    }"
  >
    <div class="error-message__content">
      <div class="error-message__icon">
        {{ icon }}
      </div>
      <div class="error-message__text">
        <div class="error-message__title" v-if="title">{{ title }}</div>
        <div class="error-message__message">{{ message }}</div>
      </div>
      <button 
        class="error-message__close" 
        @click="close"
        aria-label="关闭"
      >
        ×
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineProps, defineEmits } from 'vue'

type MessageType = 'error' | 'warning' | 'info' | 'success'

const props = defineProps<{
  type?: MessageType
  title?: string
  message: string
  duration?: number
  showClose?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const visible = ref(false)

const icon = computed(() => {
  switch (props.type) {
    case 'error':
      return '✖'
    case 'warning':
      return '⚠'
    case 'info':
      return 'ℹ'
    case 'success':
      return '✓'
    default:
      return 'ℹ'
  }
})

const close = () => {
  visible.value = false
  emit('close')
}

onMounted(() => {
  // 显示动画
  setTimeout(() => {
    visible.value = true
  }, 10)

  // 设置自动关闭
  if (props.duration && props.duration > 0) {
    setTimeout(() => {
      close()
    }, props.duration)
  }
})
</script>

<style scoped>
.error-message {
  max-width: 100%;
  width: 100%;
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  overflow: hidden;
}

.error-message--visible {
  opacity: 1;
  transform: translateX(0);
}

.error-message__content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  color: #fff;
}

.error-message--error .error-message__content {
  background-color: #f56c6c;
}

.error-message--warning .error-message__content {
  background-color: #e6a23c;
}

.error-message--info .error-message__content {
  background-color: #909399;
}

.error-message--success .error-message__content {
  background-color: #67c23a;
}

.error-message__icon {
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
  margin-top: 2px;
}

.error-message__text {
  flex: 1;
  min-width: 0;
}

.error-message__title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.error-message__message {
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.error-message__close {
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  margin-left: 12px;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.error-message__close:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .error-message {
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>