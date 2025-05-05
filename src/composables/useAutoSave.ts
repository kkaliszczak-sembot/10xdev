import { ref, watch } from 'vue';
import { toast } from 'vue-sonner';

export function useAutoSave<T extends Record<string, any>>(
  data: T,
  saveFunction: () => Promise<boolean>,
  options = {
    debounceTime: 1500,
    showNotifications: true
  }
) {
  const autoSaveTimeout = ref<number | null>(null);
  const isAutoSaving = ref(false);
  const lastAutoSaveTime = ref<Date | null>(null);
  const userHasTyped = ref(false);
  const showAutoSaveNotifications = ref(false);

  // Auto-save function
  const autoSave = async () => {
    // Don't auto-save if we're already saving
    if (isAutoSaving.value) {
      return;
    }
    
    // Skip auto-save completely if the user hasn't typed anything yet
    if (!userHasTyped.value) {
      return;
    }
    
    isAutoSaving.value = true;
    
    try {
      const success = await saveFunction();
      
      if (success) {
        lastAutoSaveTime.value = new Date();
        
        // Only show toast notification if user has interacted with the form
        if (showAutoSaveNotifications.value && options.showNotifications) {
          toast.success('Saved!');
        }
      }
    } catch (err) {
      console.error('Auto-save error:', err);
      // Only show error toast if it's not a network error (which might be frequent and annoying)
      if (err instanceof Error && !err.message.includes('network') && options.showNotifications) {
        toast.error('Failed to save');
      }
    } finally {
      isAutoSaving.value = false;
    }
  };

  // Watch for changes and auto-save after a delay
  watch(data, (newVal, oldVal) => {
    // Only proceed if this is a real user change, not initial data loading
    if (!userHasTyped.value) {
      // Check if this is an actual user edit by comparing values
      // We need to safely check for changes without using JSON.stringify to avoid circular references
      let isRealChange = false;
      
      if (oldVal && typeof oldVal === 'object') {
        // For record objects, check if any values have changed
        isRealChange = Object.keys(oldVal).some(key => {
          return oldVal[key] !== newVal[key] && newVal[key]?.trim?.() !== '';
        });
      }
      
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
    
    // Set a new timeout to auto-save after debounce time of inactivity
    autoSaveTimeout.value = setTimeout(async () => {
      await autoSave();
    }, options.debounceTime) as unknown as number;
  }, { deep: true });

  return {
    isAutoSaving,
    lastAutoSaveTime,
    userHasTyped,
    autoSave
  };
}
