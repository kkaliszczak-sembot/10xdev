<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ProjectListQueryParams } from '../../types';
import type { Tables } from '../../db/database.types';
import { Button } from '@/components/ui/button';
import type { ProjectStatus } from '@/types/project.types';

// Define emits
const emit = defineEmits<{
  (e: 'filter-change', filters: Partial<ProjectListQueryParams>): void
}>();

// Filter states
const status = ref<string>('');
const sortField = ref<string>('created_at');
const sortOrder = ref<'asc' | 'desc'>('desc');

// Status options
const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'finished', label: 'Finished' }
];

// Sort field options
const sortFieldOptions = [
  { value: 'created_at', label: 'Creation Date' },
  { value: 'updated_at', label: 'Last Updated' },
  { value: 'name', label: 'Name' }
];

// Computed property for sort order label
const sortOrderLabel = computed(() => 
  sortOrder.value === 'asc' ? 'Ascending' : 'Descending'
);

// Handle status change
const handleStatusChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  status.value = target.value;
  emitFilterChange();
};

// Handle sort field change
const handleSortFieldChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  sortField.value = target.value;
  emitFilterChange();
};

// Toggle sort order
const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  emitFilterChange();
};

// Emit filter changes to parent
const emitFilterChange = () => {
  const filters: Partial<ProjectListQueryParams> = {
    sort: sortField.value as keyof Tables<'projects'>,
    order: sortOrder.value
  };
  
  if (status.value) {
    filters.status = status.value as ProjectStatus;
  }
  
  emit('filter-change', filters);
};
</script>

<template>
  <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
    <div class="flex flex-col md:flex-row gap-4">
      <!-- Status filter -->
      <div class="flex-1">
        <label for="status-filter" class="block text-sm font-medium mb-2">Status</label>
        <select
          id="status-filter"
          v-model="status"
          class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          @change="handleStatusChange"
        >
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      
      <!-- Sort field -->
      <div class="flex-1">
        <label for="sort-field" class="block text-sm font-medium mb-2">Sort By</label>
        <select
          id="sort-field"
          v-model="sortField"
          class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          @change="handleSortFieldChange"
        >
          <option v-for="option in sortFieldOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      
      <!-- Sort order -->
      <div class="flex-1">
        <label class="block text-sm font-medium mb-2">Order</label>
        <Button 
          variant="outline"
          class="w-full justify-between"
          @click="toggleSortOrder"
        >
          <span>{{ sortOrderLabel }}</span>
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
            :class="{ 'transform rotate-180': sortOrder === 'desc' }"
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </Button>
      </div>
    </div>
  </div>
</template>
