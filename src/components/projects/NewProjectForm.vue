<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import type { CreateProjectCommand } from '../../types';

// Form state
const name = ref('');
const description = ref('');
const nameError = ref('');
const descriptionError = ref('');

// Define validation schema
const nameSchema = z.string()
  .min(1, { message: 'Project name is required' })
  .max(255, { message: 'Project name must be less than 255 characters' });

const descriptionSchema = z.string().nullable().optional();

// Loading and error states
const isSubmitting = ref(false);
const submitError = ref<string | null>(null);

// Local storage key for draft
const DRAFT_STORAGE_KEY = 'project_draft';

// Auto-save draft timer
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

// Save draft to local storage
const saveDraft = () => {
  if (name.value || description.value) {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
      name: name.value,
      description: description.value
    }));
  }
};

// Load draft from local storage
const loadDraft = () => {
  const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
  if (draft) {
    try {
      const draftData = JSON.parse(draft);
      name.value = draftData.name || '';
      description.value = draftData.description || '';
      return true;
    } catch (error) {
      console.error('Error parsing draft data:', error);
    }
  }
  return false;
};

// Clear draft from local storage
const clearDraft = () => {
  localStorage.removeItem(DRAFT_STORAGE_KEY);
};

// Validate form fields
const validateName = () => {
  try {
    nameSchema.parse(name.value);
    nameError.value = '';
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      nameError.value = error.errors[0]?.message || 'Invalid name';
    }
    return false;
  }
};

// Handle form submission
const onSubmit = async (e: Event) => {
  e.preventDefault();
  
  // Validate form
  const isNameValid = validateName();
  if (!isNameValid) {
    return;
  }
  
  isSubmitting.value = true;
  submitError.value = null;
  
  try {
    const projectData: CreateProjectCommand = {
      name: name.value,
      description: description.value || null,
    };
    
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create project');
    }
    
    const newProject = await response.json();
    
    // Clear draft after successful submission
    clearDraft();
    
    // Redirect to project details page
    window.location.href = `/projects/${newProject.id}`;
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error creating project:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Handle cancel button click
const handleCancel = () => {
  window.location.href = '/';
};

// Setup auto-save on component mount
onMounted(() => {
  // Try to load draft first
  loadDraft();
  
  // Setup auto-save timer (every 5 seconds)
  autoSaveTimer = setInterval(saveDraft, 5000);
});

// Watch for changes to save draft
watch([name, description], saveDraft);

// Clear timer on component unmount
onUnmounted(() => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
});
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Create New Project</h1>
      <p class="text-muted-foreground">
        Fill in the details below to create a new project. You can add more information later.
      </p>
    </div>
    
    <!-- Error message -->
    <div v-if="submitError" class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-6">
      <p>{{ submitError }}</p>
    </div>
    
    <form @submit="onSubmit" class="space-y-6">
      <!-- Project name field -->
      <div class="space-y-2">
        <label for="name" class="text-sm font-medium leading-none">Project Name <span class="text-destructive">*</span></label>
        <input 
          id="name"
          v-model="name"
          type="text"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter project name" 
          autocomplete="off"
          aria-required="true"
          @blur="validateName"
        />
        <p v-if="nameError" class="text-sm font-medium text-destructive">{{ nameError }}</p>
      </div>
      
      <!-- Project description field -->
      <div class="space-y-2">
        <label for="description" class="text-sm font-medium leading-none">Description</label>
        <textarea 
          id="description"
          v-model="description"
          class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter project description (optional)" 
          rows="5"
        ></textarea>
      </div>
      
      <!-- Form actions -->
      <div class="flex justify-end space-x-4 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          @click="handleCancel"
          :disabled="isSubmitting"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="mr-2">
            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ isSubmitting ? 'Creating...' : 'Create Project' }}
        </Button>
      </div>
    </form>
  </div>
</template>
