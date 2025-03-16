import type { TemplateData } from "../types";
import colors from "yoctocolors";

/**
 * Formats a template string by replacing variables with their values and optionally applying colors.
 *
 * Supports:
 * - Simple variables: \{variable\}
 * - Variables with color: \{variable:color\}
 *
 * @param template - Template string to format
 * @param data - Data to replace variables
 * @returns Formatted string
 *
 * @example
 * format("Tests: \{passed:green\} passed, \{failed:red\} failed", \{ passed: 5, failed: 2 \})
 */
function format(template: string, data: TemplateData): string {
  // eslint-disable-next-line security/detect-unsafe-regex -- This is a valid regex
  return template.replaceAll(/\{(\w+)(?::(\w+))?\}/g, (match, key: string, color?: string) => {
    if (data[key] === undefined) {
      return match;
    }

    const value = String(data[key]);

    if (!color) {
      return value;
    }

    if (colorExists(color)) {
      return applyColor(value, color);
    }

    return value;
  });
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
