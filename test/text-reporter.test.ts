import type {
  TestCase,
  TestModule,
  TestResult,
  TestResultFailed,
  TestResultPassed,
} from "vitest/node";
import type { MockInstance } from "vitest";
import type { Templates } from "../src/types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TextReporter from "../src/text-reporter";
import { DEFAULT_TEMPLATES } from "../src/constants";
import ConsoleOutput from "../src/utils/console-output";

// Create a minimal mock that provides just what we need for testing
const createTestModule = (testCases: TestCase[]): Partial<TestModule> => ({
  children: {
    *allTests(
      state?: "failed" | "passed" | "pending" | "skipped",
    ): Generator<TestCase, undefined, void> {
      for (const test of testCases) {
        if (!state || test.result().state === state) {
          yield test;
        }
      }
      return undefined;
    },
  } as unknown as TestModule["children"],
  id: "module1",
  moduleId: "/path/to/test.spec.ts",
});

describe("TextReporter", () => {
  let reporter: TextReporter;
  let stdout: { write: MockInstance };
  let mockDate: number;

  beforeEach(() => {
    // Mock process.stdout.write
    stdout = {
      write: vi.fn(),
    };
    vi.stubGlobal("process", { stdout });

    // Mock Date.now() for consistent timestamps
    mockDate = 1_000_000_000_000;
    vi.spyOn(Date, "now").mockImplementation(() => mockDate);

    // Create reporter instance
    reporter = new TextReporter();

    // Mock ConsoleOutput to track calls
    vi.spyOn(ConsoleOutput, "print");
    vi.spyOn(ConsoleOutput, "clearLine");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with default templates", () => {
      // Access private property for testing
      const templates = (reporter as unknown as { templates: Templates }).templates;
      expect(templates).toEqual(DEFAULT_TEMPLATES);
    });

    it("should merge custom templates with defaults", () => {
      const customTemplates = {
        progress: "Custom progress: {passedTests}/{totalTests}",
      };
      reporter = new TextReporter(customTemplates);
      // Access private property for testing
      const templates = (reporter as unknown as { templates: Templates }).templates;
      expect(templates.progress).toBe(customTemplates.progress);
      expect(templates.success).toBe(DEFAULT_TEMPLATES.success);
    });
  });

  describe("onInit", () => {
    it("should initialize stats and print start message if template exists", () => {
      reporter = new TextReporter({
        start: "{passedTests} passed, {failedTests} failed, {pendingTests} pending",
      });
      reporter.onInit();
      expect(ConsoleOutput.print).toHaveBeenCalledWith(
        expect.stringContaining("0 passed, 0 failed, 0 pending"),
      );
    });
  });

  describe("onTestModuleCollected", () => {
    it("should register a test module and its tests", () => {
      const mockTestCases = [
        {
          id: "test1",
          result: () => ({ state: "pending" }) as TestResult,
        },
        {
          id: "test2",
          result: () => ({ state: "pending" }) as TestResult,
        },
      ];

      reporter = new TextReporter({
        progress: "{passedTests} passed, {failedTests} failed, {pendingTests} pending",
      });
      reporter.onTestModuleCollected(createTestModule(mockTestCases as TestCase[]) as TestModule);

      // Verify the module and tests are registered by checking stats
      reporter.onInit(); // This will trigger stats calculation
      expect(ConsoleOutput.print).toHaveBeenCalledWith(
        expect.stringContaining("0 passed, 0 failed, 2 pending"),
      );
    });
  });

  describe("onTestCaseResult", () => {
    beforeEach(() => {
      // Setup a test module with two tests
      const mockModule = createTestModule([
        { id: "test1" } as TestCase,
        { id: "test2" } as TestCase,
      ]);
      reporter.onTestModuleCollected(mockModule as TestModule);
      vi.clearAllMocks(); // Clear the spies after setup
    });

    it("should update stats when a test passes", () => {
      const mockTestCase: Partial<TestCase> = {
        id: "test1",
        result: () =>
          ({
            duration: 0,
            errors: [],
            retryCount: 0,
            state: "passed",
          }) as TestResultPassed,
      };

      reporter.onTestCaseResult(mockTestCase as TestCase);

      expect(ConsoleOutput.clearLine).toHaveBeenCalled();
      expect(ConsoleOutput.print).toHaveBeenCalledWith(
        expect.stringContaining("1 passed, 0 failed, 1 pending"),
      );
    });

    it("should update stats when a test fails", () => {
      const mockTestCase: Partial<TestCase> = {
        id: "test1",
        result: () =>
          ({
            duration: 0,
            errors: [{ message: "Test failed", name: "Error" }],
            retryCount: 0,
            state: "failed",
          }) as TestResultFailed,
      };

      reporter.onTestCaseResult(mockTestCase as TestCase);

      expect(ConsoleOutput.clearLine).toHaveBeenCalled();
      expect(ConsoleOutput.print).toHaveBeenCalledWith(
        expect.stringContaining("0 passed, 1 failed, 1 pending"),
      );
    });

    it("should not update stats for other test states", () => {
      const mockTestCase: Partial<TestCase> = {
        id: "test1",
        result: () =>
          ({
            duration: 0,
            errors: [],
            retryCount: 0,
            state: "skipped",
          }) as unknown as TestResult,
      };

      reporter.onTestCaseResult(mockTestCase as TestCase);

      expect(ConsoleOutput.print).not.toHaveBeenCalled();
    });
  });

  describe("onTestRunEnd", () => {
    it("should print success message when all tests pass", () => {
      const mockTestCases = [
        {
          id: "test1",
          result: () => ({ state: "passed" }) as TestResultPassed,
        },
        {
          id: "test2",
          result: () => ({ state: "passed" }) as TestResultPassed,
        },
      ];

      reporter = new TextReporter({
        progress: "{passedTests} passed, {failedTests} failed, {pendingTests} pending",
        success: "{passedTests} passed, {failedTests} failed, {pendingTests} pending",
      });
      reporter.onTestModuleCollected(createTestModule(mockTestCases as TestCase[]) as TestModule);

      // Update test states
      for (const test of mockTestCases) {
        reporter.onTestCaseResult(test as TestCase);
      }

      vi.clearAllMocks(); // Clear spies before checking final message
      reporter.onTestRunEnd();

      expect(ConsoleOutput.print).toHaveBeenLastCalledWith(
        expect.stringContaining("2 passed, 0 failed, 0 pending"),
      );
    });

    it("should print failure message when some tests fail", () => {
      const mockTestCases = [
        {
          id: "test1",
          result: () => ({ state: "passed" }) as TestResultPassed,
        },
        {
          id: "test2",
          result: () => ({ state: "failed" }) as TestResultFailed,
        },
      ];

      reporter = new TextReporter({
        failure: "{passedTests} passed, {failedTests} failed, {pendingTests} pending",
        progress: "{passedTests} passed, {failedTests} failed, {pendingTests} pending",
      });
      reporter.onTestModuleCollected(createTestModule(mockTestCases as TestCase[]) as TestModule);

      // Update test states
      for (const test of mockTestCases) {
        reporter.onTestCaseResult(test as TestCase);
      }

      vi.clearAllMocks(); // Clear spies before checking final message
      reporter.onTestRunEnd();

      expect(ConsoleOutput.print).toHaveBeenLastCalledWith(
        expect.stringContaining("1 passed, 1 failed, 0 pending"),
      );
    });
  });
});
