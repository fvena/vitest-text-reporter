export const DEFAULT_TEMPLATES = {
  clearOnEnd: "progress",
  progress:
    "${colors.green(`${passedTests} passed`)}, ${colors.red(`${failedTests} failed`)}, ${colors.yellow(`${pendingTests} pending`)}",
} as const;
