import { defineConfig } from "vitest/config";
import swc from "unplugin-swc";
import TextReporter from "vitest-text-reporter";

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
      // new TextReporter({
      //   end: "${colors.blue(`Tests completed at ${endTime}. Total duration: ${duration}s`)}",
      //   failure: "${colors.red(`¡There are errors! ${failedTests}/${totalTests} tests failed in ${duration}s. Files: ${failedFiles}/${totalFiles} with errors.`)}",
      //   progress: "${colors.green(`${passedTests}`)} passed, ${colors.red(`${failedTests}`)} failed, ${colors.yellow(`${pendingTests}`)} pending (Time: ${duration}s)",
      //   start: "${colors.white(`Tests started at ${new Date(startTime).toISOString()}`)}",
      //   success: "${colors.green(`¡All tests passed! ${passedTests}/${totalTests} tests passed in ${duration}s. Files: ${passedFiles}/${totalFiles}.`)}",
      // }),
      new TextReporter({
        success: [
          "✅ ${colors.bold(colors.green(`${passedTests}/${totalTests}`))} tests passed in ${colors.blue(duration)}s",
          "Files: ${colors.green(`${passedFiles}/${totalFiles}`)}",
          "Started: ${colors.blue(new Date(startTime).toLocaleTimeString())}",
        ].join("\n"),
      }),
    ],
  },
});
