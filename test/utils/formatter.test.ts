import type { TemplateData } from "../../src/types";
import { describe, expect, it } from "vitest";
import Formatter from "../../src/utils/formatter";

describe("Formatter", () => {
  const greenColorStart = "\u001B[32m";
  const redColorStart = "\u001B[31m";
  const colorEnd = "\u001B[39m";

  describe("format", () => {
    const baseData: TemplateData = {
      elapsedTime: 0,
      failedFiles: 0,
      failedTests: 0,
      passedFiles: 0,
      passedTests: 0,
      pendingFiles: 0,
      pendingTests: 0,
      startTime: 0,
      timestamp: 0,
      totalFiles: 0,
      totalTests: 0,
    };

    it("should replace simple variables in template", () => {
      const template = "Tests: {passed} passed, {failed} failed";
      const data = { ...baseData, failed: 2, passed: 5 };
      const result = Formatter.format(template, data);
      expect(result).toBe("Tests: 5 passed, 2 failed");
    });

    it("should replace variables with colors", () => {
      const template = "Tests: {passed:green} passed, {failed:red} failed";
      const data = { ...baseData, failed: 2, passed: 5 };
      const result = Formatter.format(template, data);
      expect(result).toBe(
        `Tests: ${greenColorStart}5${colorEnd} passed, ${redColorStart}2${colorEnd} failed`,
      );
    });

    it("should keep original placeholder if variable is undefined", () => {
      const template = "Tests: {passed} passed, {unknown} unknown";
      const data = { ...baseData, passed: 5 };
      const result = Formatter.format(template, data);
      expect(result).toBe("Tests: 5 passed, {unknown} unknown");
    });

    it("should handle non-string values correctly", () => {
      const template = "Count: {number}, Boolean: {bool}";
      const data = { ...baseData, bool: "true", number: 42 };
      const result = Formatter.format(template, data);
      expect(result).toBe("Count: 42, Boolean: true");
    });

    it("should ignore invalid color names", () => {
      const template = "Value: {value:invalidcolor}";
      const data = { ...baseData, value: "test" };
      const result = Formatter.format(template, data);
      expect(result).toBe("Value: test");
    });

    it("should handle multiple occurrences of the same variable", () => {
      const template = "{value} and {value} and {value:red}";
      const data = { ...baseData, value: "test" };
      const result = Formatter.format(template, data);
      expect(result).toContain("test and test");
    });

    it("should handle empty template", () => {
      const template = "";
      const data = { ...baseData, value: "test" };
      const result = Formatter.format(template, data);
      expect(result).toBe("");
    });

    it("should handle template without variables", () => {
      const template = "Plain text without variables";
      const data = { ...baseData, value: "test" };
      const result = Formatter.format(template, data);
      expect(result).toBe("Plain text without variables");
    });
  });
});
