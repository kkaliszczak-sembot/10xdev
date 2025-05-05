<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { AIQuestionDTO } from '../../types';
import { ToastService } from '../../services/toast.service';
// Direct import for toast to ensure it works
import { toast } from 'vue-sonner';
// Import ToastProvider component
import ToastProvider from '@/components/ui/toast/ToastProvider.vue';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

// Props
const props = defineProps<{
  projectId: string;
}>();

// State
const isPlanningSessionActive = ref(false);
const isLoadingQuestions = ref(false);
const isLoadingMoreQuestions = ref(false); // Separate state for loading more questions
const planningQuestions = ref<AIQuestionDTO[]>([]);
const planningAnswers = ref<Record<string, string>>({});
const planningError = ref<string | null>(null);
const isSubmittingAnswers = ref(false);
const submissionSuccess = ref(false);

// Auto-save functionality
const autoSaveTimeout = ref<number | null>(null);
const isAutoSaving = ref(false);
const lastAutoSaveTime = ref<Date | null>(null);

// Number of skeleton loaders to show when loading more questions
const skeletonCount = ref(3);

// Planning session functions
const startPlanningSession = async () => {
  // Set state for planning session
  isPlanningSessionActive.value = true;
  isLoadingQuestions.value = true;
  planningError.value = null;
  planningQuestions.value = [];
  planningAnswers.value = {};
  submissionSuccess.value = false;
  
  try {
    // If no questions exist, generate new ones
    const success = await generateQuestions(5);
    
    if (!success) {
      throw new Error('Failed to generate questions');
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
    planningError.value = errorMessage;
    console.error('Error starting planning session:', err);
    toast.error(errorMessage);
    isLoadingQuestions.value = false;
    return false;
  } finally {
    isLoadingQuestions.value = false;
  }
};


const requestMoreQuestions = async () => {
  isLoadingMoreQuestions.value = true;
  planningError.value = null;
  const newQuestionsAmount = 3;
  skeletonCount.value = newQuestionsAmount; // Show 3 skeleton loaders
  
  try {
    // Generate 3 more questions
    const success = await generateQuestions(newQuestionsAmount);
    
    if (!success) {
      throw new Error('Failed to generate more questions');
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to get more questions';
    console.error('Error requesting more questions:', err);
    toast.error(errorMessage);
    return false;
  } finally {
    isLoadingMoreQuestions.value = false;
  }
};

const generatePRD = async () => {
  // This would trigger the PRD generation process
  // For now, just navigate to the existing generate-prd endpoint
  window.location.href = `/api/projects/${props.projectId}/generate-prd`;
};

// Check for existing questions on mount
const fetchExistingQuestions = async () => {
  try {
    const response = await fetch(`/api/projects/${props.projectId}/planning-questions`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch existing questions: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      // If questions exist, load them and activate the planning session
      planningQuestions.value = data.data;
      
      // Initialize answers for new questions
      planningQuestions.value.forEach((question: AIQuestionDTO) => {
        planningAnswers.value[question.id] = question.answer || '';
      });
      
      // Reset flags to prevent auto-save notifications on initial load
      userHasTyped.value = false;
      showAutoSaveNotifications.value = false;
      
      // Activate the planning session if questions exist
      isPlanningSessionActive.value = true;
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
    console.error('Error fetching existing questions:', err);
    toast.error(errorMessage);
  }
};

// Generate new questions
const generateQuestions = async (count = 5) => {
  isLoadingQuestions.value = true;
  planningError.value = null;
  
  try {
    const response = await fetch(`/api/projects/${props.projectId}/generate-questions?count=${count}&startSequenceNumber=${(planningQuestions.value.at(-1)?.sequence_number ?? 0) + 1}`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate questions: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format: expected data.data to be an array');
    }
    
    // Add new questions to existing ones
    const existingIds = planningQuestions.value.map((q: AIQuestionDTO) => q.id);
    const newQuestions = data.data.filter((q: AIQuestionDTO) => !existingIds.includes(q.id));
    
    planningQuestions.value = [...planningQuestions.value, ...newQuestions];
    
    // Initialize answers for new questions
    newQuestions.forEach((question: AIQuestionDTO) => {
      planningAnswers.value[question.id] = '';
    });
    
    toast.success(`${newQuestions.length} new questions added!`);
    
    return true;
  } catch (err) {
    planningError.value = err instanceof Error ? err.message : 'An error occurred';
    console.error('Error generating questions:', err);
    return false;
  } finally {
    isLoadingQuestions.value = false;
  }
};

// Track if we've made any changes that need to be saved
const hasUnsavedChanges = ref(false);

// Flag to track if the user has actually typed something
const userHasTyped = ref(false);

// Disable auto-save notifications until user has interacted with the form
const showAutoSaveNotifications = ref(false);

// Auto-save answers function
const autoSaveAnswers = async () => {
  // Don't auto-save if we're already submitting or if there's an error
  if (isSubmittingAnswers.value || planningError.value) {
    return;
  }
  
  // Only save if we have questions and at least one answer with content
  const hasAnswers = Object.values(planningAnswers.value).some(answer => answer.trim() !== '');
  if (!planningQuestions.value.length || !hasAnswers) {
    return;
  }
  
  // Skip auto-save completely if the user hasn't typed anything yet
  if (!userHasTyped.value) {
    return;
  }
  
  isAutoSaving.value = true;
  
  try {
    // Format answers for submission
    const formattedAnswers = Object.entries(planningAnswers.value)
      .filter(([_, answer]) => answer.trim() !== '') // Only submit non-empty answers
      .map(([questionId, answer]) => {
        const question = planningQuestions.value.find(q => q.id === questionId);
        return {
          question_id: questionId,
          question: question?.question || '',
          answer
        };
      });
    
    const response = await fetch(`/api/projects/${props.projectId}/planning-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ answers: formattedAnswers })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to auto-save: ${response.statusText}`);
    }
    
    lastAutoSaveTime.value = new Date();
    
    // Only show toast notification if user has interacted with the form
    if (showAutoSaveNotifications.value) {
      toast.success('Answers saved!');
    }
  } catch (err) {
    console.error('Auto-save error:', err);
    // Only show error toast if it's not a network error (which might be frequent and annoying)
    if (err instanceof Error && !err.message.includes('network')) {
      toast.error('Failed to save answers');
    }
  } finally {
    isAutoSaving.value = false;
  }
};

// No redundant variables needed

// Watch for changes in answers and auto-save after a delay
watch(planningAnswers, (newVal, oldVal) => {
  // Only proceed if this is a real user change, not initial data loading
  if (!userHasTyped.value) {
    // Check if this is an actual user edit by comparing values
    const isRealChange = oldVal && Object.keys(oldVal).some(key => {
      return oldVal[key] !== newVal[key] && newVal[key].trim() !== '';
    });
    
    if (isRealChange) {
      // User has made their first edit
      userHasTyped.value = true;
      showAutoSaveNotifications.value = true;
    } else {
      // Skip auto-save for initial data loading
      return;
    }
  }
  
  // Clear any existing timeout
  if (autoSaveTimeout.value !== null) {
    clearTimeout(autoSaveTimeout.value);
  }
  
  // Set a new timeout to auto-save after 1.5 seconds of inactivity
  autoSaveTimeout.value = setTimeout(async () => {
    await autoSaveAnswers();
  }, 1500) as unknown as number;
}, { deep: true });

// Check for existing questions when the component is mounted
onMounted(() => {
  fetchExistingQuestions();
});
</script>

<template>
  <!-- Include ToastProvider to ensure toast notifications work -->
  <ToastProvider />
  
  <Card class="border-primary/10 shadow-sm mt-8">
    <CardHeader class="bg-muted/20">
      <CardTitle class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
        AI Planning Session
      </CardTitle>
      <CardDescription>
        Let AI help you refine your project by asking targeted questions
      </CardDescription>
    </CardHeader>
    <CardContent class="pt-6">
      <div v-if="!isPlanningSessionActive" class="flex flex-col items-center justify-center py-8">
        <p class="text-center text-muted-foreground mb-6">
          Start an AI planning session to refine your project details through a series of targeted questions.
          This will help generate a more comprehensive PRD document.
        </p>
        <Button 
          size="lg" 
          @click="startPlanningSession"
          class="px-8"
        >
          Start Planning Session
        </Button>
      </div>
      
      <div v-else>
        <!-- Initial loading state - only shown when starting a new session -->
        <div v-if="isLoadingQuestions && planningQuestions.length === 0" class="flex flex-col items-center justify-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p class="text-center text-muted-foreground">Loading questions...</p>
        </div>
        
        <!-- Error state -->
        <div v-else-if="planningError" class="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-6">
          <p>{{ planningError }}</p>
          <Button variant="outline" class="mt-4" @click="startPlanningSession">
            Try Again
          </Button>
        </div>
        
        <!-- Questions form -->
        <div v-else>
          <div v-if="planningQuestions.length === 0" class="text-center py-6">
            <p class="text-muted-foreground">No questions available. Please try again.</p>
            <Button variant="outline" class="mt-4" @click="startPlanningSession">
              Retry
            </Button>
          </div>
          <form v-else>
            <div class="text-sm text-muted-foreground mb-4">
              {{ planningQuestions.length }} questions available
            </div>
            <!-- Existing questions -->
            <div v-for="question in planningQuestions" :key="question.id" class="mb-6 p-4 border border-border rounded-lg question-item">
              <FormField :name="`question-${question.id}`">
                <FormItem>
                  <FormLabel class="text-lg font-medium">{{ question.sequence_number }}. {{ question.question }}</FormLabel>
                  <FormControl>
                    <Textarea
                      v-model="planningAnswers[question.id]"
                      placeholder="Your answer..."
                      class="min-h-[60px] mt-2"
                    />
                  </FormControl>
                </FormItem>
              </FormField>
            </div>
            
            <!-- Skeleton loaders for new questions being loaded -->
            <div v-if="isLoadingMoreQuestions" class="space-y-6">
              <div v-for="i in skeletonCount" :key="`skeleton-${i}`" class="mb-6 p-4 border border-border rounded-lg animate-pulse">
                <div class="h-6 w-3/4 bg-muted rounded mb-4"></div>
                <div class="h-24 bg-muted rounded"></div>
              </div>
            </div>
            
            <div class="flex gap-x-3 justify-end mt-8">
              <Button 
                type="button" 
                variant="outline" 
                @click="requestMoreQuestions"
                :disabled="isSubmittingAnswers || isLoadingMoreQuestions"
                :class="{ 'opacity-50 cursor-not-allowed': isLoadingMoreQuestions }"
              >
                Ask More Questions
              </Button>
              <Button 
                type="submit" 
                :disabled="isSubmittingAnswers"
              >
                <span v-if="isSubmittingAnswers">Submitting...</span>
                <span v-else>Generate PRD</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
