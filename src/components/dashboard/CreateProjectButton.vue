<script setup lang="ts">
import { Button } from '@/components/ui/button';

// Function to navigate to create project page
const navigateToCreateProject = () => {
  window.location.href = '/projects/new';
};
</script>

<template>
  <Button variant="default" @click="navigateToCreateProject">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
    <span>New Project</span>
  </Button>
</template>
