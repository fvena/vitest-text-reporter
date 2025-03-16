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
        colors: true,
        end: "Pruebas completadas a las {endTime}. Duración total: {totalTime:blue}s",
        failure:
          "¡Hay errores! {failedTests:red}/{totalTests} tests fallidos en {totalTime:yellow}s. " +
          "Archivos: {failedFiles:red}/{totalFiles} con fallos.",
        progress:
          "{passedTests:green} pasados, {failedTests:red} fallidos, {pendingTests:yellow} pendientes (Tiempo: {elapsedTime}s)",
        start: "Tests iniciados a las {startTime}",
        success:
          "¡Todo correcto! {passedTests:green}/{totalTests} tests pasados en {totalTime:cyan}s. " +
          "Archivos: {passedFiles:green}/{totalFiles}.",
      }),
    ],
  },
});
