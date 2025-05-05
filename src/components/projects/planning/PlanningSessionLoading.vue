<script setup lang="ts">
// No props or emits needed for this simple loading component
</script>

<template>
  <div class="flex flex-col items-center justify-center py-8">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
    <p class="text-center text-muted-foreground">Loading questions...</p>
  </div>
</template>
