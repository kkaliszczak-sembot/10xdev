import { ref } from 'vue';

/**
 * Simple event bus implementation using Vue's reactivity system
 * Provides a way to communicate between components without prop drilling
 */
export class EventBusService {
  private static events = {
    prdGenerated: ref<{ projectId: string; prd: string } | null>(null)
  };

  /**
   * Emit a PRD generated event
   * @param projectId - ID of the project with the generated PRD
   * @param prd - The generated PRD content
   */
  static emitPrdGenerated(projectId: string, prd: string): void {
    this.events.prdGenerated.value = { projectId, prd };
  }

  /**
   * Get the PRD generated event reference
   * This can be watched in components to react to PRD generation
   */
  static getPrdGeneratedEvent() {
    return this.events.prdGenerated;
  }
}
