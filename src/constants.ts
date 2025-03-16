export const DEFAULT_TEMPLATES = {
  failure: "Some tests failed in {totalTime}s! Files: {failedFiles}/{totalFiles} failed.",
  progress:
    "{passedTests} passed, {failedTests} failed, {pendingTests} pending (Total tests: {totalTests})",
  success: "All tests passed in {totalTime}s! Files: {passedFiles}/{totalFiles} passed.",
} as const;
