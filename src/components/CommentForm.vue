<template>
  <div class="comment-form">
    <h4>{{ t('addComment') }}</h4>
    <div class="form-group">
      <label for="commenter">{{ t('yourName') }}:</label>
      <input 
        id="commenter"
        v-model="commenter"
        type="text"
        :placeholder="t('anonymous')"
        class="form-input"
      />
    </div>
    <div class="form-group">
      <label for="commentText">{{ t('yourComment') }}:</label>
      <textarea 
        id="commentText"
        v-model="commentText"
        rows="3"
        :placeholder="t('enterComment')"
        class="form-textarea"
      ></textarea>
    </div>
    <div class="form-group">
      <label for="commentImage">{{ t('imageUrl') }}:</label>
      <input 
        id="commentImage"
        v-model="imageUrl"
        type="url"
        :placeholder="t('optionalImageUrl')"
        class="form-input"
      />
    </div>
    <div class="form-group">
      <label>{{ t('newsStatus') }}:</label>
      <div class="choice-buttons">
        <button 
          type="button"
          class="btn choice-btn" 
          :class="{ active: choice === 'not_fake' }"
          @click="choice = 'not_fake'"
        >
          ✅ {{ t('notFakeShort') }}
        </button>
        <button 
          type="button"
          class="btn choice-btn" 
          :class="{ active: choice === 'fake' }"
          @click="choice = 'fake'"
        >
          ❌ {{ t('fakeShort') }}
        </button>
      </div>
    </div>
    <button 
      type="button"
      class="btn submit-btn" 
      @click="submitComment"
      :disabled="!commentText.trim()"
    >
      {{ t('submitComment') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStore } from '../store'
import { useI18n } from '../i18n'
import type { VoteChoice } from '../types'

const props = defineProps<{
  newsId: number
}>()

const emit = defineEmits<{
  commentAdded: []
}>()

const { addVote } = useStore()
const { t } = useI18n()

const commenter = ref('')
const commentText = ref('')
const imageUrl = ref('')
const choice = ref<VoteChoice>('not_fake')

const submitComment = () => {
  if (!commentText.value.trim()) return
  
  addVote({
    newsId: props.newsId,
    choice: choice.value,
    comment: commentText.value,
    imageUrl: imageUrl.value || undefined,
    voter: commenter.value || undefined
  })
  
  // 清空表单
  commenter.value = ''
  commentText.value = ''
  imageUrl.value = ''
  
  // 触发事件通知父组件
  emit('commentAdded')
}
</script>

<style scoped>
.comment-form {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.comment-form h4 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #165DFF;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4E5969;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #D9E1F2;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #165DFF;
  box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.choice-buttons {
  display: flex;
  gap: 12px;
}

.choice-btn {
  flex: 1;
  padding: 8px 16px;
  background-color: #ffffff;
  border: 1px solid #D9E1F2;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.choice-btn:hover {
  border-color: #165DFF;
}

.choice-btn.active {
  background-color: #165DFF;
  color: #ffffff;
  border-color: #165DFF;
}

.submit-btn {
  width: 100%;
  padding: 10px;
  background-color: #165DFF;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #0E42D2;
}

.submit-btn:disabled {
  background-color: #BFBFBF;
  cursor: not-allowed;
}
</style>