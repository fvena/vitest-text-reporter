export const DEFAULT_TEMPLATES = {
  failure: "${colors.red(`${passedTests} passed, ${failedTests} failed in ${duration}s!`)}",
  progress:
    "${colors.green(`${passedTests}`)} passed, ${colors.red(`${failedTests}`)} failed, ${colors.yellow(`${pendingTests}`)} pending",
  success: "${colors.green(`${passedTests} passed in ${duration}s!`)}",
} as const;
