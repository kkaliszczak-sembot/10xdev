<script setup lang="ts">
import { Toaster } from 'vue-sonner';
</script>

<template>
  <Toaster 
    richColors 
    closeButton 
    position="top-right" 
    :expand="false"
    :toastOptions="{
      duration: 4000
    }"
  />
</template>
