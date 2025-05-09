<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { ProjectListItemDTO, PaginationDTO, ProjectListQueryParams } from '../../types';
// Import components with explicit type casting to avoid TypeScript errors
import SearchBar from './SearchBar.vue';
import FilterPanel from './FilterPanel.vue';
import ProjectList from './ProjectList.vue';
import Pagination from './Pagination.vue';
import CreateProjectButton from './CreateProjectButton.vue';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// State for projects and pagination
const projects = ref<ProjectListItemDTO[]>([]);
const pagination = ref<PaginationDTO>({
  total_count: 0,
  page_count: 0,
  current_page: 1,
  per_page: 10
});

// Query parameters state
const queryParams = ref<ProjectListQueryParams>({
  page: 1,
  limit: 10,
  search: '',
  sort: 'created_at',
  order: 'desc'
});

// Loading and error states
const isLoading = ref(false);
const error = ref<string | null>(null);

// Fetch projects from API
const fetchProjects = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    // Build query string from parameters
    const params = new URLSearchParams();
    
    if (queryParams.value.page) {
      params.append('page', queryParams.value.page.toString());
    }
    
    if (queryParams.value.limit) {
      params.append('limit', queryParams.value.limit.toString());
    }
    
    if (queryParams.value.search) {
      params.append('search', queryParams.value.search);
    }
    
    if (queryParams.value.status) {
      params.append('status', queryParams.value.status);
    }
    
    if (queryParams.value.sort) {
      params.append('sort', queryParams.value.sort);
    }
    
    if (queryParams.value.order) {
      params.append('order', queryParams.value.order);
    }
    
    // Make API request
    const response = await fetch(`/api/projects?${params.toString()}`);
    
    // Handle HTTP errors
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    // Parse response
    const data = await response.json();
    
    // Update state
    projects.value = data.data;
    pagination.value = data.pagination;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Error fetching projects:', err);
  } finally {
    isLoading.value = false;
  }
};

// Handle search query changes
const handleSearch = (searchQuery: string) => {
  queryParams.value = {
    ...queryParams.value,
    search: searchQuery,
    page: 1 // Reset to first page on new search
  };
};

// Handle filter changes
const handleFilterChange = (filters: Partial<ProjectListQueryParams>) => {
  queryParams.value = {
    ...queryParams.value,
    ...filters,
    page: 1 // Reset to first page on filter change
  };
};

// Handle pagination changes
const handlePageChange = (page: number) => {
  queryParams.value.page = page;
};

// Watch for query parameter changes and fetch data
watch(queryParams, () => {
  fetchProjects();
}, { deep: true });

// Initial data fetch
onMounted(() => {
  fetchProjects();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Projects</h1>
      <CreateProjectButton />
    </div>
    
    <div class="mb-6">
      <SearchBar @search="handleSearch" />
    </div>
    
    <div class="mb-6">
      <FilterPanel @filter-change="handleFilterChange" />
    </div>
    
    <!-- Loading state -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
      <div v-for="i in 6" :key="i" class="space-y-4">
        <Skeleton class="h-[125px] w-full rounded-lg" />
      </div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-6">
      <p class="mb-2">{{ error }}</p>
      <Button 
        variant="destructive" 
        size="sm"
        @click="fetchProjects"
      >
        Try Again
      </Button>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="projects.length === 0" class="text-center py-12 border rounded-lg bg-muted/20">
      <div class="p-8 space-y-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="mx-auto h-12 w-12 text-muted-foreground"
        >
          <rect width="8" height="14" x="8" y="5" rx="1" />
          <path d="M4 5h4" />
          <path d="M16 5h4" />
          <path d="M4 10h4" />
          <path d="M16 10h4" />
          <path d="M4 15h4" />
          <path d="M16 15h4" />
        </svg>
        <p class="text-xl font-semibold">No projects found</p>
        <p class="text-muted-foreground">Create your first project to get started</p>
      </div>
    </div>
    
    <!-- Projects list -->
    <ProjectList v-else :projects="projects" />
    
    <!-- Pagination -->
    <Pagination 
      v-if="pagination.page_count > 1" 
      :pagination="pagination" 
      @page-change="handlePageChange" 
    />
  </div>
</template>
