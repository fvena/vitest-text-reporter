export const DEFAULT_TEMPLATES = {
  failure: "{{ passedTests }} passed, {{ failedFiles }} failed in {{ duration }}s!",
  progress: "{{ passedTests }} passed, {{ failedTests }} failed, {{ pendingTests }} pending",
  success: "{{ passedTests }} passed in {{ duration }}s!",
} as const;
