<script setup lang="ts">
import { computed } from 'vue';
import type { ProjectListItemDTO } from '../../types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Define props
const props = defineProps<{
  project: ProjectListItemDTO
}>();

// Format date to a more readable format
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

// Computed properties for formatted dates
const createdDate = computed(() => formatDate(props.project.created_at));

// Get status badge variant based on project status
const statusVariant = computed(() => {
  switch (props.project.status) {
    case 'new':
      return 'secondary';
    case 'in_progress':
      return 'default';
    case 'finished':
      return 'destructive';
    default:
      return 'outline';
  }
});

// Format status text for display
const statusText = computed(() => {
  switch (props.project.status) {
    case 'new':
      return 'New';
    case 'in_progress':
      return 'In Progress';
    case 'finished':
      return 'Finished';
    default:
      return props.project.status;
  }
});

// Truncate description if it's too long
const truncatedDescription = computed(() => {
  if (!props.project.description) return '';
  return props.project.description.length > 120
    ? `${props.project.description.substring(0, 120)}...`
    : props.project.description;
});
</script>

<template>
  <a :href="`/projects/${project.id}`" class="block h-full no-underline">
    <Card class="h-full hover:shadow-md transition-shadow duration-300 cursor-pointer">
      <CardHeader class="pb-2">
        <div class="flex justify-between items-start">
          <CardTitle class="truncate">{{ project.name }}</CardTitle>
          <Badge :variant="statusVariant">{{ statusText }}</Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <CardDescription class="h-12 line-clamp-2">
          {{ truncatedDescription || 'No description provided' }}
        </CardDescription>
      </CardContent>
      
      <CardFooter class="text-xs text-muted-foreground pt-0">
        <span>Created: {{ createdDate }}</span>
      </CardFooter>
    </Card>
  </a>
</template>
