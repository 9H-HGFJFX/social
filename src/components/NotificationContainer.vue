<template>
  <div class="notification-container">
    <ErrorMessage
      v-for="notification in notifications"
      :key="notification.id"
      :message="notification.message"
      :title="notification.title"
      :type="notification.type"
      :duration="notification.duration"
      :show-close="notification.showClose"
      @close="removeNotification(notification.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ErrorMessage from './ErrorMessage.vue'
import { useNotification } from '../services/notificationService'

const notificationService = useNotification()
const notifications = computed(() => notificationService.getNotifications().value)

const removeNotification = (id: number) => {
  notificationService.remove(id)
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  max-height: 100vh;
  overflow-y: auto;
}
</style>