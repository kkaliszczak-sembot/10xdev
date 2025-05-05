<script setup lang="ts">
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

const updateAnswer = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
};
</script>

<template>
  <div class="mb-6 p-4 border border-border rounded-lg question-item">
    <FormField :name="`question-${question.id}`">
      <FormItem>
        <FormLabel class="text-lg font-medium">{{ question.sequence_number }}. {{ question.question }}</FormLabel>
        <FormControl>
          <Textarea
            :value="modelValue"
            @input="updateAnswer"
            placeholder="Your answer..."
            class="min-h-[60px] mt-2"
          />
        </FormControl>
      </FormItem>
    </FormField>
  </div>
</template>
