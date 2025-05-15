<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { AIQuestionDTO } from '@/types';
import { ToastService } from '@/services/client/toast.service';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Import extracted components
import PlanningSessionHeader from './planning/PlanningSessionHeader.vue';
import PlanningSessionIntro from './planning/PlanningSessionIntro.vue';
import PlanningSessionLoading from './planning/PlanningSessionLoading.vue';
import PlanningSessionError from './planning/PlanningSessionError.vue';
import PlanningQuestionsForm from './planning/PlanningQuestionsForm.vue';

// Import services
import { PlanningService } from '@/services/server/planning.service';
import { ProjectClientService } from '@/services/client/project.client.service';
import { EventBusService } from '@/services/client/event-bus.service';

// Import composables
import { useAutoSave } from '@/composables/useAutoSave';

// Props
const props = defineProps<{
  projectId: string;
}>();

// State
const isPlanningSessionActive = ref(false);
const isLoadingQuestions = ref(false);
const isLoadingMoreQuestions = ref(false);
const planningQuestions = ref<AIQuestionDTO[]>([]);
const planningAnswers = ref<Record<string, string>>({});
const planningError = ref<string | null>(null);
const isSubmittingAnswers = ref(false);
const submissionSuccess = ref(false);

// Number of skeleton loaders to show when loading more questions
const skeletonCount = ref(3);

// Setup auto-save functionality
const saveAnswers = async () => {
  // Only save if we have questions and at least one answer with content
  const hasAnswers = Object.values(planningAnswers.value).some(answer => answer.trim() !== '');
  if (!planningQuestions.value.length || !hasAnswers) {
    return false;
  }

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

    return await PlanningService.saveAnswers(props.projectId, formattedAnswers);
  } catch (err) {
    console.error('Auto-save error:', err);
    return false;
  }
};

// Use the auto-save composable
const { isAutoSaving, lastAutoSaveTime } = useAutoSave(planningAnswers, saveAnswers, { debounceTime: 1000, showNotifications: true });

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
    // Generate new questions
    const newQuestions = await PlanningService.generateQuestions(props.projectId, 5);

    // Add questions to state
    planningQuestions.value = newQuestions;

    // Initialize answers for new questions
    newQuestions.forEach((question: AIQuestionDTO) => {
      planningAnswers.value[question.id] = '';
    });

    ToastService.success(`${newQuestions.length} questions generated!`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
    planningError.value = errorMessage;
    console.error('Error starting planning session:', err);
    ToastService.error(errorMessage);
  } finally {
    isLoadingQuestions.value = false;
  }
};

const requestMoreQuestions = async () => {
  isLoadingMoreQuestions.value = true;
  planningError.value = null;
  const newQuestionsAmount = 5;
  skeletonCount.value = newQuestionsAmount;

  try {
    // Calculate the next sequence number
    const startSequenceNumber = (planningQuestions.value.at(-1)?.sequence_number ?? 0) + 1;

    // Get project details for context using the client-side service
    const projectDetails = await ProjectClientService.getProjectById(props.projectId);

    if (!projectDetails) {
      throw new Error('Failed to fetch project details');
    }

    // Generate more questions using AI
    const generatedQuestions = await PlanningService.generateQuestions(
      props.projectId,
      newQuestionsAmount,
      startSequenceNumber
    );

    planningQuestions.value = [...planningQuestions.value, ...generatedQuestions];

    // Initialize answers for new questions
    generatedQuestions.forEach((question: AIQuestionDTO) => {
      planningAnswers.value[question.id] = '';
    });

    ToastService.success(`${generatedQuestions.length} new AI-generated questions added!`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to get more questions';
    console.error('Error requesting more questions:', err);
    ToastService.error(errorMessage);

    // Fallback to standard question generation if AI fails
    try {
      const startSequenceNumber = (planningQuestions.value.at(-1)?.sequence_number ?? 0) + 1;
      const newQuestions = await PlanningService.generateQuestions(
        props.projectId,
        newQuestionsAmount,
        startSequenceNumber
      );

      const existingIds = planningQuestions.value.map((q: AIQuestionDTO) => q.id);
      const filteredNewQuestions = newQuestions.filter((q: AIQuestionDTO) => !existingIds.includes(q.id));

      planningQuestions.value = [...planningQuestions.value, ...filteredNewQuestions];

      filteredNewQuestions.forEach((question: AIQuestionDTO) => {
        planningAnswers.value[question.id] = '';
      });

      ToastService.success(`${filteredNewQuestions.length} new questions added (fallback mode)`);
    } catch (fallbackErr) {
      console.error('Fallback question generation also failed:', fallbackErr);
    }
  } finally {
    isLoadingMoreQuestions.value = false;
  }
};

// Generate PRD based on answered questions
const generatePRD = async () => {
  isSubmittingAnswers.value = true;

  try {
    // Save answers first to ensure all data is up-to-date
    await saveAnswers();

    // Generate PRD
    const result = await ProjectClientService.generatePRD(props.projectId);

    if (result && result.status === 'success' && result.project && result.project.prd) {
      // Emit event through the event bus
      EventBusService.emitPrdGenerated(props.projectId, result.project.prd);

      ToastService.success('PRD generated successfully!');
    } else {
      throw new Error('Failed to generate PRD');
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to generate PRD';
    console.error('Error generating PRD:', err);
    ToastService.error(errorMessage);
  } finally {
    isSubmittingAnswers.value = false;
  }
};

// Check for existing questions on mount
const fetchExistingQuestions = async () => {
  try {
    const questions = await PlanningService.fetchExistingQuestions(props.projectId);

    if (questions && questions.length > 0) {
      // If questions exist, load them and activate the planning session
      planningQuestions.value = questions;

      // Initialize answers for questions
      questions.forEach((question: AIQuestionDTO) => {
        planningAnswers.value[question.id] = question.answer || '';
      });

      // Activate the planning session if questions exist
      isPlanningSessionActive.value = true;
    }
  } catch (err) {
    console.error('Error fetching existing questions:', err);
  }
};

// Check for existing questions when the component is mounted
onMounted(() => {
  fetchExistingQuestions();
});
</script>

<template>
  <Card class="border-primary/10 shadow-sm mt-8">
    <PlanningSessionHeader />
    <CardContent class="pt-6">
      <!-- Initial loading state - only shown when starting a new session -->
      <PlanningSessionLoading v-if="isLoadingQuestions && planningQuestions.length === 0" />

      <!-- Error state -->
      <PlanningSessionError v-else-if="planningError" :error-message="planningError" @retry="startPlanningSession" />

      <!-- Intro screen when no planning session is active and no questions exist -->
      <PlanningSessionIntro v-else-if="!isPlanningSessionActive && planningQuestions.length === 0"
        @start-session="startPlanningSession" />

      <!-- Questions form -->
      <div v-else>
        <div v-if="planningQuestions.length === 0" class="text-center py-6">
          <p class="text-muted-foreground">No questions available. Please try again.</p>
          <Button variant="outline" class="mt-4" @click="startPlanningSession">
            Retry
          </Button>
        </div>

        <!-- Questions form when questions are available -->
        <PlanningQuestionsForm v-else :questions="planningQuestions" :answers="planningAnswers"
          :is-loading-more="isLoadingMoreQuestions" :is-submitting="isSubmittingAnswers"
          @update:answers="planningAnswers = $event" @request-more-questions="requestMoreQuestions"
          @generate-p-r-d="generatePRD" />
      </div>

      <!-- Auto-save indicator -->
      <div v-if="isAutoSaving" class="text-xs text-muted-foreground mt-2 text-right">
        Saving...
      </div>
      <div v-else-if="lastAutoSaveTime" class="text-xs text-muted-foreground mt-2 text-right">
        Last saved: {{ new Date(lastAutoSaveTime).toLocaleTimeString() }}
      </div>
    </CardContent>
  </Card>
</template>
