<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { useForm } from 'vee-validate';
import { z } from 'zod';
import { toTypedSchema } from '@vee-validate/zod';
import { marked } from 'marked';
import type { ProjectDetailsDTO, UpdateProjectCommand } from '../../types';
import PlanningSession from './PlanningSession.vue';
import { EventBusService } from '@/services/client/event-bus.service';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToastService } from '@/services/client/toast.service';

// Props
const props = defineProps<{
  projectId: string;
}>();

// State
const project = ref<ProjectDetailsDTO | null>(null);
const isLoading = ref(true);
const isSaving = ref(false);
const isEditing = ref(false);
const error = ref<string | null>(null);

// Form validation schema
const formSchema = toTypedSchema(z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string(),
  main_problem: z.string().nullable(),
  min_feature_set: z.string().nullable(),
  out_of_scope: z.string().nullable(),
  success_criteria: z.string().nullable(),
}));

// Setup form with proper handling of reactive values
const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    description: '',
    main_problem: '',
    min_feature_set: '',
    out_of_scope: '',
    success_criteria: '',
  }
});

// Create local state for form values to avoid readonly issues
const formValues = ref({
  name: '',
  description: '',
  main_problem: '',
  min_feature_set: '',
  out_of_scope: '',
  success_criteria: '',
});

// Format date to a more readable format
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Computed property for safe project description access
const projectDescription = computed(() => {
  if (!project.value || !project.value.description) return '';
  return typeof project.value.description === 'string' ? project.value.description : '';
});

// Computed property for PRD content
const hasPRD = computed(() => {
  return Boolean(project.value?.prd);
});

const prdHtml = computed(() => {
  return project.value?.prd ? project.value.prd.replaceAll(/\\n/g, '<br>') : '';
});

// Get status badge variant based on project status
const getStatusVariant = (status: string | null | undefined) => {
  if (!status) return 'outline';

  switch (status) {
    case 'new':
      return 'secondary';
    case 'in_progress':
      return 'default';
    case 'finished':
      return 'destructive';
    default:
      return 'outline';
  }
};

// Format status text for display
const getStatusText = (status: string | null | undefined) => {
  if (!status) return 'Unknown';

  switch (status) {
    case 'new':
      return 'New';
    case 'in_progress':
      return 'In Progress';
    case 'finished':
      return 'Finished';
    default:
      return status;
  }
};

// Fetch project details
const fetchProject = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetch(`/api/projects/${props.projectId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.statusText}`);
    }

    const data = await response.json();
    project.value = data;

    // Update local form values
    formValues.value = {
      name: data.name || '',
      description: data.description || '',
      main_problem: data.main_problem || '',
      min_feature_set: data.min_feature_set || '',
      out_of_scope: data.out_of_scope || '',
      success_criteria: data.success_criteria || '',
    };

    // Initialize form with project data
    form.setValues(formValues.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
    console.error('Error fetching project:', err);
  } finally {
    isLoading.value = false;
  }
};

// Start editing mode
const startEditing = () => {
  // Make sure form values are up to date before entering edit mode
  if (project.value) {
    formValues.value = {
      name: project.value.name || '',
      description: project.value.description || '',
      main_problem: project.value.main_problem || '',
      min_feature_set: project.value.min_feature_set || '',
      out_of_scope: project.value.out_of_scope || '',
      success_criteria: project.value.success_criteria || '',
    };
    form.setValues(formValues.value);
  }
  isEditing.value = true;
};

// Cancel editing and revert to original values
const cancelEditing = () => {
  // Reset form values to current project data
  if (project.value) {
    formValues.value = {
      name: project.value.name || '',
      description: project.value.description || '',
      main_problem: project.value.main_problem || '',
      min_feature_set: project.value.min_feature_set || '',
      out_of_scope: project.value.out_of_scope || '',
      success_criteria: project.value.success_criteria || '',
    };
    form.setValues(formValues.value);
  }
  isEditing.value = false;
};

// Save project changes
const saveProject = async () => {
  isSaving.value = true;
  error.value = null;

  // Validate the form first
  const { valid } = await form.validate();
  if (!valid) {
    isSaving.value = false;
    error.value = 'Please fix the validation errors before saving';
    return;
  }

  try {
    const updateData: UpdateProjectCommand = {
      name: formValues.value.name,
      description: formValues.value.description,
      main_problem: formValues.value.main_problem,
      min_feature_set: formValues.value.min_feature_set,
      out_of_scope: formValues.value.out_of_scope,
      success_criteria: formValues.value.success_criteria,
    };

    const response = await fetch(`/api/projects/${props.projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update project: ${response.statusText}`);
    }

    ToastService.success('Project updated successfully');
    const updatedProject = await response.json();
    project.value = updatedProject;
    isEditing.value = false; // Exit editing mode after successful save

    // Update form values to reflect the latest data
    form.setValues({
      name: updatedProject.name || '',
      description: updatedProject.description || '',
      main_problem: updatedProject.main_problem || '',
      min_feature_set: updatedProject.min_feature_set || '',
      out_of_scope: updatedProject.out_of_scope || '',
      success_criteria: updatedProject.success_criteria || '',
    });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred';
    console.error('Error updating project:', err);
  } finally {
    isSaving.value = false;
  }
};

// Planning session functions moved to PlanningSession.vue

// Watch for project ID changes and fetch project
watch(() => props.projectId, () => {
  fetchProject();
}, { immediate: true });

// Listen for PRD updates from the EventBusService
const unsubscribePrdUpdates = () => {
  // No explicit unsubscribe needed as we're using Vue's reactivity system
};

// Setup listener for PRD updates
onMounted(() => {
  // Watch for PRD generated events
  watch(EventBusService.getPrdGeneratedEvent(), (event) => {
    if (event && event.projectId === props.projectId) {
      // Update the project data with the new PRD content
      if (project.value) {
        project.value.prd = event.prd;
      }
    }
  });
});

// Clean up event listeners when component is unmounted
onUnmounted(() => {
  unsubscribePrdUpdates();
});

// Fetch project on component mount
fetchProject();
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header with back button -->
    <div class="flex items-center mb-6">
      <a href="/" class="mr-4">
        <Button variant="outline" size="sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </Button>
      </a>
      <h1 class="text-3xl font-bold">Project Details</h1>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="space-y-4">
      <div class="h-8 w-1/3 bg-gray-200 rounded animate-pulse"></div>
      <div class="h-24 w-full bg-gray-200 rounded animate-pulse"></div>
      <div class="h-40 w-full bg-gray-200 rounded animate-pulse"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error"
      class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-6">
      <p class="mb-2">{{ error }}</p>
      <Button variant="destructive" size="sm" @click="fetchProject">
        Try Again
      </Button>
    </div>

    <!-- Project details -->
    <div v-else-if="project" class="space-y-6">
      <!-- Project header card with editable title and description -->
      <Card class="overflow-hidden border-primary/10 shadow-sm">
        <form class="w-full" @submit.prevent="saveProject()">
          <CardHeader class="pb-2">
            <div class="flex justify-between items-start">
              <div class="w-full pr-4">
                <!-- Project name display and edit -->
                <div class="mb-2">
                  <div v-if="!isEditing"
                    class="text-2xl font-bold px-2 -ml-2 cursor-pointer hover:bg-muted/30 rounded transition-colors"
                    @click="startEditing">
                    {{ project.name || 'Untitled Project' }}
                  </div>
                  <Input v-else v-model="formValues.name"
                    class="text-2xl font-bold border p-2 h-auto focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:ring-offset-0 bg-muted/10 rounded px-2 transition-colors"
                    placeholder="Enter project name" @keydown.esc="cancelEditing"
                    @input="form.setFieldValue('name', formValues.name)" />
                </div>

                <!-- Project description display and edit -->
                <div>
                  <div v-if="!isEditing"
                    class="text-sm text-muted-foreground px-2 -ml-2 cursor-pointer hover:bg-muted/30 rounded transition-colors min-h-[40px] py-1"
                    @click="startEditing">
                    <p v-if="projectDescription">{{ projectDescription }}</p>
                    <p v-else class="italic text-muted-foreground/70">Click to add a description</p>
                  </div>
                  <Textarea v-else v-model="formValues.description"
                    class="resize-none min-h-[80px] border p-2 text-sm text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:ring-offset-0 bg-muted/10 rounded px-2 transition-colors"
                    placeholder="Add a project description" @keydown.esc="cancelEditing"
                    @input="form.setFieldValue('description', formValues.description)" />
                </div>
              </div>
              <Badge :class="`ml-2 shrink-0`" :variant="getStatusVariant(project.status)">
                {{ getStatusText(project.status) }}
              </Badge>
            </div>
          </CardHeader>
          <CardFooter class="flex justify-between text-sm text-muted-foreground border-t pt-4 bg-muted/10">
            <div class="flex justify-between w-full">
              <span>Created: {{ formatDate(project.created_at) }}</span>
              <span>Last updated: {{ formatDate(project.updated_at) }}</span>
            </div>
            <div class="flex space-x-2">
              <Button v-if="isEditing" class="ml-2" type="button" size="sm" variant="outline" @click="cancelEditing">
                Cancel
              </Button>
              <Button v-if="!isEditing" type="button" size="sm" variant="outline" class="flex items-center ml-3"
                @click="startEditing">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
              </Button>
              <Button v-if="isEditing" type="submit" size="sm" :disabled="isSaving" variant="default">
                <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground"
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                <span v-if="isSaving">Saving...</span>
                <span v-else>Save</span>
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>

      <!-- Project details form -->
      <Card class="border-primary/10 shadow-sm">
        <CardHeader class="bg-muted/20">
          <CardTitle class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Project Details
          </CardTitle>
          <CardDescription>
            Define the key aspects of your project to help guide its development
          </CardDescription>
        </CardHeader>
        <CardContent class="pt-6">
          <Form @submit="saveProject">
            <div class="space-y-6">

              <!-- Main problem -->
              <FormField name="main_problem">
                <FormItem>
                  <FormLabel>Main Problem</FormLabel>
                  <FormControl>
                    <Textarea v-model="formValues.main_problem" placeholder="What problem does this project solve?"
                      class="min-h-[120px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <!-- Minimal feature set -->
              <FormField name="min_feature_set">
                <FormItem>
                  <FormLabel>Minimal Feature Set</FormLabel>
                  <FormControl>
                    <Textarea v-model="formValues.min_feature_set"
                      placeholder="What are the essential features needed for this project?" class="min-h-[120px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <!-- Out of scope features -->
              <FormField name="out_of_scope">
                <FormItem>
                  <FormLabel>Out of Scope Features</FormLabel>
                  <FormControl>
                    <Textarea v-model="formValues.out_of_scope"
                      placeholder="What features or aspects are explicitly not included in this project?"
                      class="min-h-[120px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <!-- Success criteria -->
              <FormField name="success_criteria">
                <FormItem>
                  <FormLabel>Success Criteria</FormLabel>
                  <FormControl>
                    <Textarea v-model="formValues.success_criteria"
                      placeholder="How will you measure the success of this project?" class="min-h-[120px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <div class="flex justify-end">
                <Button type="submit" :disabled="isSaving">
                  <span v-if="isSaving">Saving...</span>
                  <span v-else>Save Changes</span>
                </Button>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>

      <!-- Planning Session Component -->
      <PlanningSession :project-id="props.projectId" />

      <!-- PRD Section - Only shown when PRD exists -->
      <Card v-if="hasPRD" class="border-primary/10 shadow-sm mt-8">
        <CardHeader>
          <CardTitle class="text-xl font-semibold">Project Requirements Document</CardTitle>
          <CardDescription>Generated PRD based on your project planning answers</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="prose prose-sm max-w-none" v-html="prdHtml"></div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
