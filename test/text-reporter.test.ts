import type { Templates } from "../src/types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TextReporter from "../src/text-reporter";
import ConsoleOutput from "../src/utils/console-output";
import { DEFAULT_TEMPLATES } from "../src/constants";
import { createTestCase, createTestModule } from "./test-utilities";

describe("TextReporter", () => {
  let mockDate: number;

  beforeEach(() => {
    // Mock Date.now() for consistent timestamps
    mockDate = 1_000_000_000_000;
    vi.spyOn(Date, "now").mockImplementation(() => mockDate);

    // Mock ConsoleOutput to track calls
    vi.spyOn(ConsoleOutput, "print");
    vi.spyOn(ConsoleOutput, "clearLine");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with default templates", () => {
      const reporter = new TextReporter();
      const templates = (reporter as unknown as { templates: Templates }).templates;
      expect(templates).toEqual(DEFAULT_TEMPLATES);
    });
  });

  describe("onInit", () => {
    it("should initialize stats and print start message if template exists", () => {
      const reporter = new TextReporter({
        start: "Starting tests...",
      });
      reporter.onInit();
      expect(ConsoleOutput.print).toHaveBeenCalledWith("Starting tests...");
    });

    it("should not print start message if template does not exist", () => {
      const reporter = new TextReporter();
      reporter.onInit();
      expect(ConsoleOutput.print).not.toHaveBeenCalled();
    });
  });

  describe("onTestModuleCollected", () => {
    it("should register a test module and its tests", () => {
      const reporter = new TextReporter();
      reporter.onInit();
      reporter.onTestModuleCollected(
        createTestModule(["test1", "test2"], "module1", "/path/to/test.spec.ts"),
      );
      reporter.onTestModuleCollected(
        createTestModule(["test3", "test4"], "module2", "/path/to/test2.spec.ts"),
      );
      reporter.onTestModuleCollected(
        createTestModule(["test5", "test6"], "module3", "/path/to/test3.spec.ts"),
      );

      expect(ConsoleOutput.print).toHaveBeenCalledWith("0 passed, 0 failed, 2 pending");
      expect(ConsoleOutput.print).toHaveBeenCalledWith("0 passed, 0 failed, 4 pending");
      expect(ConsoleOutput.print).toHaveBeenCalledWith("0 passed, 0 failed, 6 pending");
    });
  });

  describe("onTestCaseResult", () => {
    let reporter: TextReporter;

    beforeEach(() => {
      reporter = new TextReporter();
      reporter.onInit();
      reporter.onTestModuleCollected(createTestModule(["test1", "test2"]));
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it("should update stats when a test passes", () => {
      reporter.onTestCaseResult(createTestCase("test1", "passed"));

      expect(ConsoleOutput.clearLine).toHaveBeenCalledTimes(2);
      expect(ConsoleOutput.print).toHaveBeenCalledWith("0 passed, 0 failed, 2 pending");
      expect(ConsoleOutput.print).toHaveBeenCalledWith("1 passed, 0 failed, 1 pending");
    });

    it("should update stats when a test fails", () => {
      reporter.onTestCaseResult(
        createTestCase("test1", "failed", { message: "Test failed", name: "Error" }),
      );

      expect(ConsoleOutput.clearLine).toHaveBeenCalledTimes(2);
      expect(ConsoleOutput.print).toHaveBeenCalledWith("0 passed, 0 failed, 2 pending");
      expect(ConsoleOutput.print).toHaveBeenCalledWith("0 passed, 1 failed, 1 pending");
    });

    it("should update stats multiple times when multiple tests are updated", () => {
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestCaseResult(
        createTestCase("test2", "failed", { message: "Test failed", name: "Error" }),
      );

      expect(ConsoleOutput.clearLine).toHaveBeenCalledTimes(3);
      expect(ConsoleOutput.print).toHaveBeenCalledWith("0 passed, 0 failed, 2 pending");
      expect(ConsoleOutput.print).toHaveBeenCalledWith("1 passed, 0 failed, 1 pending");
      expect(ConsoleOutput.print).toHaveBeenCalledWith("1 passed, 1 failed, 0 pending");
    });

    it("should skip tests if the state is not passed or failed", () => {
      reporter.onTestCaseResult(createTestCase("test1", "skipped"));

      expect(ConsoleOutput.clearLine).toHaveBeenCalledTimes(1);
      expect(ConsoleOutput.print).toHaveBeenCalledWith("0 passed, 0 failed, 2 pending");
      expect(ConsoleOutput.print).toHaveBeenCalledTimes(1);
    });

    it("should print custom progress message if template exists", () => {
      const reporter = new TextReporter({
        progress:
          "Progress: {{ passedTests }} passed, {{ failedTests }} failed, {{ pendingTests }} pending",
      });
      reporter.onInit();
      reporter.onTestModuleCollected(createTestModule(["test1", "test2"]));
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestCaseResult(
        createTestCase("test2", "failed", { message: "Test failed", name: "Error" }),
      );

      expect(ConsoleOutput.print).toHaveBeenCalledWith("Progress: 1 passed, 0 failed, 1 pending");
      expect(ConsoleOutput.print).toHaveBeenCalledWith("Progress: 1 passed, 1 failed, 0 pending");
    });
  });

  describe("onTestRunEnd", () => {
    let reporter: TextReporter;

    beforeEach(() => {
      reporter = new TextReporter();
      reporter.onInit();
      reporter.onTestModuleCollected(createTestModule(["test1", "test2"]));
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it("should print success message when all tests pass", () => {
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestCaseResult(createTestCase("test2", "passed"));
      reporter.onTestRunEnd();

      expect(ConsoleOutput.print).toHaveBeenLastCalledWith("2 passed in 0s!");
    });

    it("should print success message when all tests pass with custom template", () => {
      const reporter = new TextReporter({
        success: "All tests passed in {{ duration }}s!",
      });
      reporter.onInit();
      reporter.onTestModuleCollected(createTestModule(["test1", "test2"]));
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestCaseResult(createTestCase("test2", "passed"));
      reporter.onTestRunEnd();

      expect(ConsoleOutput.print).toHaveBeenLastCalledWith("All tests passed in 0s!");
    });

    it("should print failure message when some tests fail", () => {
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestCaseResult(
        createTestCase("test2", "failed", { message: "Test failed", name: "Error" }),
      );
      reporter.onTestRunEnd();

      expect(ConsoleOutput.print).toHaveBeenLastCalledWith("1 passed, 1 failed in 0s!");
    });

    it("should print failure message when some tests fail with custom template", () => {
      const reporter = new TextReporter({
        failure: "Some tests failed in {{ duration }}s!",
      });
      reporter.onInit();
      reporter.onTestModuleCollected(createTestModule(["test1", "test2"]));
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestCaseResult(
        createTestCase("test2", "failed", { message: "Test failed", name: "Error" }),
      );
      reporter.onTestRunEnd();

      expect(ConsoleOutput.print).toHaveBeenLastCalledWith("Some tests failed in 0s!");
    });

    it("should print end message if template exists", () => {
      const reporter = new TextReporter({
        end: "End message in {{ duration }}s!",
      });
      reporter.onInit();
      reporter.onTestModuleCollected(createTestModule(["test1", "test2"]));
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestCaseResult(
        createTestCase("test2", "failed", { message: "Test failed", name: "Error" }),
      );
      reporter.onTestRunEnd();

      expect(ConsoleOutput.print).toHaveBeenLastCalledWith("End message in 0s!");
    });
  });
});
