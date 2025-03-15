import type { Options } from "tsup";
import { defineConfig } from "tsup";

/**
 * Node.js Build Configuration
 *
 * This configuration generates ESM and CJS formats suitable for Node.js environments
 * and bundlers. It produces both formats from a single configuration which
 * simplifies maintenance and ensures consistency across outputs.
 */
const nodeConfig: Options = {
  clean: true, // Remove previous build files before each build
  dts: true, // Generate TypeScript declaration files (.d.ts)
  entry: ["src/index.ts"], // The entry points to your library. You can add more entry points if needed.
  format: ["esm", "cjs"], // Generates both ESM and CJS formats simultaneously
  minify: true, // Minifies the output to reduce bundle size
  outDir: "./dist", // Directory where build files will be output
  sourcemap: true, // Generate source maps to make debugging easier
  treeshake: true, // Enables tree shaking to remove unused code and reduce bundle size
};

/**
 * tsup Configuration Function
 *
 * This function returns different configurations based on the build context.
 * It's especially useful for providing optimized development and production builds.
 */
export default defineConfig((options) => {
  // Development mode (watch)
  // When running with --watch flag, we optimize for faster rebuilds
  // by disabling minification and only building the Node.js formats
  if (options.watch) {
    return [
      {
        ...nodeConfig,
        minify: false, // This is enabled by default but disabled in watch mode for faster development
        ...options,
      },
    ];
  }

  // Production mode
  // Build all formats with optimizations enabled
  return [
    { ...nodeConfig, ...options }, // Node.js builds (ESM, CJS)
  ];
});
