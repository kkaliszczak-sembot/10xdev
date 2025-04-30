<script setup lang="ts">
import { ref, watch } from 'vue';
import { Input } from '@/components/ui/input';

// Define emits
const emit = defineEmits<{
  (e: 'search', query: string): void
}>();

// Search query state
const searchQuery = ref('');
const debouncedQuery = ref('');

// Debounce search to avoid excessive API calls
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

// Watch for search query changes and debounce
watch(searchQuery, (newValue) => {
  // Clear previous timeout
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }
  
  // Set new timeout
  debounceTimeout = setTimeout(() => {
    debouncedQuery.value = newValue;
    emit('search', newValue);
  }, 300); // 300ms debounce delay
});

// Clear search query
const clearSearch = () => {
  searchQuery.value = '';
  emit('search', '');
};

// Handle form submission
const handleSubmit = (e: Event) => {
  e.preventDefault();
  emit('search', searchQuery.value);
};
</script>

<template>
  <form @submit="handleSubmit" class="relative">
    <div class="relative flex w-full max-w-sm items-center space-x-2">
      <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      
      <Input
        type="search"
        v-model="searchQuery"
        class="pl-10 pr-10"
        placeholder="Search projects..."
        aria-label="Search projects"
      />
      
      <button
        v-if="searchQuery"
        type="button"
        @click="clearSearch"
        class="absolute inset-y-0 right-3 flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500 hover:text-gray-700">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </form>
</template>
