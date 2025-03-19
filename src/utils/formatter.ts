import type { TemplateData } from "../types";
import colors from "yoctocolors";

/**
 * Formats a template string by replacing variables with their values and optionally applying colors.
 *
 * Supports:
 * - Simple variables: \{\{ variable \}\}
 * - Variables with color: \{\{ variable:color \}\}
 *
 * @param template - Template string to format
 * @param data - Data to replace variables
 * @returns Formatted string
 *
 * @example
 * format("Tests: \{\{ passed:green \}\} passed, \{\{ failed:red \}\} failed", \{ passed: 5, failed: 2 \})
 */
function format(template: string, data: TemplateData): string {
   
  return template.replaceAll(
    /\{\{\s*(\w+)(?::([.\w]+))?\s*\}\}/g,
    (match, key: string, styles?: string) => {
      if (data[key] === undefined) {
        return match;
      }

      let value = String(data[key]);

      if (!styles) {
        return value;
      }

      // Apply each style in sequence
      const styleList = styles.split(".");
      for (const style of styleList) {
        if (colorExists(style)) {
          value = applyColor(value, style);
        }
      }

      return value;
    },
  );
}

/**
 * Checks if a color exists in yoctocolors
 */
function colorExists(color: string): boolean {
  return typeof colors[color as keyof typeof colors] === "function";
}

/**
 * Applies a color using yoctocolors
 */
function applyColor(text: string, color: string): string {
  return colors[color as keyof typeof colors](text);
}

export default {
  format,
};
