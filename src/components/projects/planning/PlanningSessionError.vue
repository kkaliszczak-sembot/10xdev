<script setup lang="ts">
import { Button } from '@/components/ui/button';

const props = defineProps<{
  errorMessage: string;
}>();

const emit = defineEmits<{
  (e: 'retry'): void;
}>();
</script>

<template>
  <div class="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-6">
    <p>{{ errorMessage }}</p>
    <Button variant="outline" class="mt-4" @click="emit('retry')">
      Try Again
    </Button>
  </div>
</template>
