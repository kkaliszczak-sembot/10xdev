<script setup lang="ts">
import { defineProps } from 'vue';
import type { ProjectListItemDTO } from '../../types';
import ProjectCard from './ProjectCard.vue';

// Define props
const props = defineProps<{
  projects: ProjectListItemDTO[]
}>();
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <ProjectCard 
      v-for="project in projects" 
      :key="project.id" 
      :project="project" 
    />
  </div>
</template>
