<template>
  <div class="layout">
    <div v-show="state.progressActive" class="top-progress"><div class="bar" :style="{ width: state.progressValue + '%' }"></div></div>
    <header class="header">
      <div class="brand">
        <RouterLink to="/">{{ t('brand') }}</RouterLink>
      </div>
      <nav class="nav" style="display:flex; align-items:center">
        <span style="color:#666">{{ t('language') }}</span>
        <select :value="lang" @change="onLangChange" class="language-select">
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
        <span style="margin-left:12px"></span>
        <RouterLink to="/" active-class="active" exact>{{ t('nav_home') }}</RouterLink>
        <RouterLink to="/import" active-class="active">{{ t('nav_import') }}</RouterLink>
        <RouterLink to="/statistics" active-class="active">{{ t('nav_statistics') }}</RouterLink>
        <RouterLink to="/report" active-class="active">{{ t('nav_report') }}</RouterLink>
      </nav>
    </header>
    <main class="main">
      <RouterView />
    </main>
    <footer class="footer">© {{ new Date().getFullYear() }} {{ t('brand') }} Demo</footer>
    <!-- <NotificationContainer /> -->
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useI18n } from './i18n'
import { useStore } from './store'

const { t, lang, setLang } = useI18n()
const { state } = useStore()
const onLangChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  setLang(target.value as any)
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.language-select {
  margin-left: 8px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.nav a {
  color: #333;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav a:hover {
  background-color: #f5f5f5;
}

.nav a.active {
  background-color: #e5e7eb;
  font-weight: 500;
}

.top-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: transparent;
  z-index: 9999;
}

.top-progress .bar {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #06b6d4);
  transition: width 0.2s ease;
}

.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  padding: 2rem;
}

.footer {
  text-align: center;
  padding: 1rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}
</style>