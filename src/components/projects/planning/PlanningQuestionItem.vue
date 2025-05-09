<script setup lang="ts">
import { computed } from 'vue';
import type { AIQuestionDTO } from '@/types';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

const props = defineProps<{
  question: AIQuestionDTO;
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

// Create a computed property with getter and setter for v-model
const answer = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
});
</script>

<template>
  <div class="mb-6 p-4 border border-border rounded-lg question-item">
    <FormField :name="`question-${question.id}`">
      <FormItem>
        <FormLabel class="text-lg font-medium">{{ question.sequence_number }}. {{ question.question }}</FormLabel>
        <FormControl>
          <Textarea
            v-model="answer"
            placeholder="Your answer..."
            class="min-h-[60px] mt-2"
          />
        </FormControl>
      </FormItem>
    </FormField>
  </div>
</template>
