import { defineConfig } from "vitest/config";
import swc from "unplugin-swc";
import CustomReporter from "vitest-text-reporter";

export default defineConfig({
  plugins: [
    swc.vite({
      module: { type: "es6" },
    }),
  ],
  test: {
    clearMocks: true,
    coverage: {
      include: ["src/**/*.ts"],
      provider: "v8",
      reporter: ["text", "lcovonly"],
    },
    environment: "node", // jsdom
    globals: true,
    reporters: [
      new CustomReporter({
        end: "Tests completed at {endTime}. Total duration: {totalTime:blue}s",
        failure:
          "¡There are errors! {failedTests:red}/{totalTests} tests failed in {totalTime:yellow}s. " +
          "Files: {failedFiles:red}/{totalFiles} with errors.",
        progress:
          "{passedTests:green} passed, {failedTests:red} failed, {pendingTests:yellow} pending (Time: {elapsedTime}s)",
        start: "Tests started at {startTime}",
        success:
          "¡All tests passed! {passedTests:green}/{totalTests} tests passed in {totalTime:cyan}s. " +
          "Files: {passedFiles:green}/{totalFiles}.",
      }),
    ],
  },
});
