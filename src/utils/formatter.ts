import type { TemplateData } from "../types";
import * as yoctocolors from "yoctocolors";

/**
 * Formats a text string as a template literal using yoctocolors for terminal styling
 * @param template - The template string
 * @param data - The data object to use for variable substitution
 * @returns The formatted string
 */
function format(template: string, data: TemplateData): string {
  try {
    // Ensure data is an object
    if (typeof data !== "object") {
      data = {};
    }

    // Create a context with the data and colors available
    const context = {
      ...data,
      colors: yoctocolors,
    };

    // Convert object keys to a list of parameters
    const keys = Object.keys(context);
    const values = Object.values(context);

    // Create a function that will evaluate the template literal
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- Explicitly allowed
    const evaluator = new Function(...keys, `return \`${template}\`;`) as (
      ...arguments_: unknown[]
    ) => string;

    // Execute the function with our context values
    return evaluator(...values);
  } catch (error) {
    console.error("Error processing template:", error);
    return template; // Return original template if there's an error
  }
}

export default {
  format,
};
