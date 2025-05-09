<script setup lang="ts">
import { ref, computed } from 'vue';
import type { AIQuestionDTO } from '@/types';
import { Button } from '@/components/ui/button';
import PlanningQuestionItem from './PlanningQuestionItem.vue';
// Import toast for notifications
import { ToastService } from '@/services/client/toast.service';

const props = defineProps<{
  questions: AIQuestionDTO[];
  answers: Record<string, string>;
  isLoadingMore: boolean;
  isSubmitting: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:answers', value: Record<string, string>): void;
  (e: 'requestMoreQuestions'): void;
  (e: 'generatePRD'): void;
}>();

// Number of skeleton loaders to show when loading more questions
const skeletonCount = ref(3);

// Update a specific answer
const updateAnswer = (questionId: string, value: string) => {
  const updatedAnswers = { ...props.answers, [questionId]: value };
  emit('update:answers', updatedAnswers);
};

// Count of available questions
const questionCount = computed(() => props.questions.length);

// Handle form submission
const submitForm = () => {
  ToastService.info('Generating PRD...');
  emit('generatePRD');
};
</script>

<template>
  <form @submit.prevent="submitForm">
    <div class="text-sm text-muted-foreground mb-4">
      {{ questionCount }} questions available
    </div>
    
    <!-- Existing questions -->
    <PlanningQuestionItem
      v-for="question in questions"
      :key="question.id"
      :question="question"
      :model-value="answers[question.id] || ''"
      @update:model-value="value => updateAnswer(question.id, value)"
    />
    
    <!-- Skeleton loaders for new questions being loaded -->
    <div v-if="isLoadingMore" class="space-y-6">
      <div v-for="i in skeletonCount" :key="`skeleton-${i}`" class="mb-6 p-4 border border-border rounded-lg animate-pulse">
        <div class="h-6 w-3/4 bg-muted rounded mb-4"></div>
        <div class="h-24 bg-muted rounded"></div>
      </div>
    </div>
    
    <div class="flex gap-x-3 justify-end mt-8">
      <Button 
        type="button" 
        variant="outline" 
        :disabled="isSubmitting || isLoadingMore"
        :class="{ 'opacity-50 cursor-not-allowed': isLoadingMore }"
        @click="emit('requestMoreQuestions')"
      >
        Ask More Questions
      </Button>
      <Button 
        type="submit" 
        :disabled="isSubmitting"
      >
        <span v-if="isSubmitting">Submitting...</span>
        <span v-else>Generate PRD</span>
      </Button>
    </div>
  </form>
</template>
