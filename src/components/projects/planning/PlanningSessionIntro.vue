<script setup lang="ts">
import { Button } from '@/components/ui/button';

const emit = defineEmits<{
  (e: 'startSession'): void;
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center py-8">
    <p class="text-center text-muted-foreground mb-6">
      Start an AI planning session to refine your project details through a series of targeted questions.
      This will help generate a more comprehensive PRD document.
    </p>
    <Button 
      size="lg" 
      @click="emit('startSession')"
      class="px-8"
    >
      Start Planning Session
    </Button>
  </div>
</template>
