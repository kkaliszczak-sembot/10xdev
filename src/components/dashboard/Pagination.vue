<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
import type { PaginationDTO } from '../../types';

// Define props
const props = defineProps<{
  pagination: PaginationDTO
}>();

// Define emits
const emit = defineEmits<{
  (e: 'page-change', page: number): void
}>();

// Generate array of page numbers to display
const pageNumbers = computed(() => {
  const { current_page, page_count } = props.pagination;
  const delta = 1; // Number of pages to show on each side of current page
  
  // Calculate range of pages to show
  let start = Math.max(current_page - delta, 1);
  let end = Math.min(current_page + delta, page_count);
  
  // Adjust range to always show 2*delta+1 pages if possible
  const pagesShown = end - start + 1;
  if (pagesShown < 2 * delta + 1) {
    if (start === 1) {
      end = Math.min(start + 2 * delta, page_count);
    } else if (end === page_count) {
      start = Math.max(end - 2 * delta, 1);
    }
  }
  
  // Generate array of page numbers
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

// Check if we should show first page button
const showFirstPage = computed(() => {
  return pageNumbers.value[0] > 1;
});

// Check if we should show last page button
const showLastPage = computed(() => {
  return pageNumbers.value[pageNumbers.value.length - 1] < props.pagination.page_count;
});

// Handle page change
const changePage = (page: number) => {
  if (page === props.pagination.current_page) return;
  if (page < 1 || page > props.pagination.page_count) return;
  
  emit('page-change', page);
};
</script>

<template>
  <div class="flex justify-center mt-8">
    <div class="flex items-center justify-center space-x-2 py-4">
      <!-- Previous page button -->
      <button
        :disabled="pagination.current_page === 1"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1"
        @click="changePage(pagination.current_page - 1)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span>Previous</span>
      </button>

      <!-- First page + ellipsis -->
      <template v-if="showFirstPage">
        <button
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
          @click="changePage(1)"
        >
          1
        </button>
        <span class="flex h-10 w-10 items-center justify-center">...</span>
      </template>

      <!-- Page numbers -->
      <button
        v-for="page in pageNumbers"
        :key="page"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input h-10 w-10"
        :class="page === pagination.current_page ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent hover:text-accent-foreground'"
        @click="changePage(page)"
      >
        {{ page }}
      </button>

      <!-- Last page + ellipsis -->
      <template v-if="showLastPage">
        <span class="flex h-10 w-10 items-center justify-center">...</span>
        <button
          class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
          @click="changePage(pagination.page_count)"
        >
          {{ pagination.page_count }}
        </button>
      </template>

      <!-- Next page button -->
      <button
        :disabled="pagination.current_page === pagination.page_count"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1"
        @click="changePage(pagination.current_page + 1)"
      >
        <span>Next</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-4 w-4"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>
