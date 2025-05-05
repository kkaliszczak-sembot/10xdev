<script setup lang="ts">
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
</script>

<template>
  <CardHeader class="bg-muted/20">
    <CardTitle class="flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
        <path d="m9 12 2 2 4-4"></path>
      </svg>
      AI Planning Session
    </CardTitle>
    <CardDescription>
      Let AI help you refine your project by asking targeted questions
    </CardDescription>
  </CardHeader>
</template>
