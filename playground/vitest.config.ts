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
      new TextReporter({
        clearOnEnd: "none",
        end: "${colors.blue(`Tests completed at ${new Date(endTime).toLocaleTimeString()}`)}",
        failure:
          "${colors.red(`¡There are errors! ${failedTests}/${totalTests} tests failed in ${duration}s. Files: ${failedFiles}/${totalFiles} with errors.`)}",
        progress: [
          "${colors.gray(`Test Files  ${colors.bold(colors.green(passedFiles + ' passed'))} (${totalFiles})`)}",
          "${colors.gray(`     Tests  ${colors.bold(colors.green(passedTests + ' passed'))} (${totalTests})`)}",
          "${colors.gray(`  Duration  ${colors.white(duration + 's')}`)}",
        ].join("\n"),
        start: "${colors.white(`Tests started at ${new Date(startTime).toLocaleTimeString()}`)}",
        success:
          "${colors.green(`¡All tests passed! ${passedTests}/${totalTests} tests passed in ${duration}s. Files: ${passedFiles}/${totalFiles}.`)}",
      }),
    ],
  },
});
