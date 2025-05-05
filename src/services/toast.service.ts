/**
 * Toast Service
 * Provides a centralized way to display toast notifications
 * Uses the vue-sonner library via shadcn-vue
 */
import { toast } from 'vue-sonner';

// For debugging
console.log('Toast service initialized', toast);

/**
 * Toast types
 */
export type ToastType = 'default' | 'success' | 'error' | 'info' | 'warning';

/**
 * Toast options interface
 */
export interface ToastOptions {
  /** Duration in milliseconds */
  duration?: number;
  /** Whether the toast is dismissible */
  dismissible?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Description text */
  description?: string;
  /** Action component */
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Toast Service
 * Provides methods to show different types of toast notifications
 */
export class ToastService {
  /**
   * Show a default toast notification
   * @param message - The message to display
   * @param options - Toast options
   */
  static show(message: string, options?: ToastOptions): void {
    toast(message, options);
  }

  /**
   * Show a success toast notification
   * @param message - The message to display
   * @param options - Toast options
   */
  static success(message: string, options?: ToastOptions): void {
    toast.success(message, options);
  }

  /**
   * Show an error toast notification
   * @param message - The message to display
   * @param options - Toast options
   */
  static error(message: string, options?: ToastOptions): void {
    toast.error(message, options);
  }

  /**
   * Show an info toast notification
   * @param message - The message to display
   * @param options - Toast options
   */
  static info(message: string, options?: ToastOptions): void {
    toast.info(message, options);
  }

  /**
   * Show a warning toast notification
   * @param message - The message to display
   * @param options - Toast options
   */
  static warning(message: string, options?: ToastOptions): void {
    toast.warning(message, options);
  }

  /**
   * Show a loading toast notification that can be updated later
   * @param message - The message to display
   * @param options - Toast options
   * @returns A promise and an ID to update the toast
   */
  static loading(message: string, options?: ToastOptions): { id: string; update: (props: any) => void; dismiss: () => void } {
    const toastId = crypto.randomUUID();
    const toastInstance = toast.loading(message, { id: toastId, ...options });
    
    return {
      id: toastId,
      update: (props: any) => toast.update(toastId, props),
      dismiss: () => toast.dismiss(toastId)
    };
  }

  /**
   * Dismiss a specific toast by ID
   * @param id - The toast ID
   */
  static dismiss(id: string): void {
    toast.dismiss(id);
  }

  /**
   * Dismiss all toasts
   */
  static dismissAll(): void {
    toast.dismiss();
  }
}
