<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="not-found-title">{{ t('pageNotFound') }}</h1>
      <p class="not-found-message">{{ t('pageNotFoundMessage') }}</p>
      <div class="not-found-actions">
        <router-link to="/" class="btn btn-primary">
          {{ t('goHome') }}
        </router-link>
        <button @click="goBack" class="btn btn-secondary">
          {{ t('goBack') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
}

.not-found-content {
  text-align: center;
  max-width: 600px;
  width: 100%;
  padding: 3rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.not-found-title {
  font-size: 3rem;
  color: #333;
  margin-bottom: 1rem;
}

.not-found-message {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.not-found-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

@media (max-width: 768px) {
  .not-found-content {
    padding: 2rem;
  }
  
  .not-found-title {
    font-size: 2rem;
  }
  
  .not-found-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 200px;
  }
}
</style>