import type { Templates } from "../src/types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TextReporter from "../src/text-reporter";
import ConsoleOutput from "../src/utils/console-output";
import { DEFAULT_TEMPLATES } from "../src/constants";
import { createTestCase, createTestModule } from "./test-utilities";

const expectedProgress = (passed: number, failed: number, pending: number) =>
  `\u001B[32m${passed.toString()} passed\u001B[39m, \u001B[31m${failed.toString()} failed\u001B[39m, \u001B[33m${pending.toString()} pending\u001B[39m\n`;

let spyPrint: ReturnType<typeof vi.spyOn>;

describe("TextReporter", () => {
  let mockDate: number;

  beforeEach(() => {
    // Mock Date.now() for consistent timestamps
    mockDate = 1_000_000_000_000;
    vi.spyOn(Date, "now").mockImplementation(() => mockDate);

    // Mock ConsoleOutput to track calls
    spyPrint = vi.spyOn(ConsoleOutput, "print").mockImplementation(() => {
      // ...
    });
    vi.spyOn(ConsoleOutput, "clearLine").mockImplementation(() => {
      /* empty */
    });
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
    it("should print start message if template exists", () => {
      const reporter = new TextReporter({
        start: "Starting tests...",
      });
      reporter.onInit();
      expect(ConsoleOutput.print).toHaveBeenCalledWith("Starting tests...\n");
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

      expect(ConsoleOutput.print).toHaveBeenCalledWith(expectedProgress(0, 0, 2));
      expect(ConsoleOutput.print).toHaveBeenCalledWith(expectedProgress(0, 0, 4));
      expect(ConsoleOutput.print).toHaveBeenCalledWith(expectedProgress(0, 0, 6));
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

      expect(ConsoleOutput.clearLine).toHaveBeenCalledTimes(1);
      expect(ConsoleOutput.print).toHaveBeenCalledWith(expectedProgress(0, 0, 2));
      expect(ConsoleOutput.print).toHaveBeenCalledWith(expectedProgress(1, 0, 1));
    });

    it("should update stats when a test fails", () => {
      reporter.onTestCaseResult(
        createTestCase("test1", "failed", { message: "Test failed", name: "Error" }),
      );

      expect(ConsoleOutput.clearLine).toHaveBeenCalledTimes(1);
      expect(ConsoleOutput.print).toHaveBeenCalledWith(expectedProgress(0, 0, 2));
      expect(ConsoleOutput.print).toHaveBeenCalledWith(expectedProgress(0, 1, 1));
    });

    it("should update stats multiple times when multiple tests are updated", () => {
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestCaseResult(
        createTestCase("test2", "failed", { message: "Test failed", name: "Error" }),
      );

      expect(ConsoleOutput.clearLine).toHaveBeenCalledTimes(2);
      expect(ConsoleOutput.print).toHaveBeenCalledWith(expectedProgress(0, 0, 2));
      expect(ConsoleOutput.print).toHaveBeenCalledWith(expectedProgress(1, 0, 1));
      expect(ConsoleOutput.print).toHaveBeenCalledWith(expectedProgress(1, 1, 0));
    });

    it("should skip tests if the state is not passed or failed", () => {
      reporter.onTestCaseResult(createTestCase("test1", "skipped"));

      expect(ConsoleOutput.clearLine).toHaveBeenCalledTimes(0);
      expect(ConsoleOutput.print).toHaveBeenCalledWith(expectedProgress(0, 0, 2));
      expect(ConsoleOutput.print).toHaveBeenCalledTimes(1);
    });

    it("should print custom progress message if template exists", () => {
      const reporter = new TextReporter({
        progress:
          "Custom progress message: ${colors.green(`${passedTests}`)} passed, ${colors.red(`${failedTests}`)} failed, ${colors.yellow(`${pendingTests}`)} pending",
      });
      reporter.onInit();
      reporter.onTestModuleCollected(createTestModule(["test1", "test2"]));
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestCaseResult(
        createTestCase("test2", "failed", { message: "Test failed", name: "Error" }),
      );

      expect(ConsoleOutput.print).toHaveBeenCalledWith(
        "Custom progress message: \u001B[32m1\u001B[39m passed, \u001B[31m0\u001B[39m failed, \u001B[33m1\u001B[39m pending\n",
      );
      expect(ConsoleOutput.print).toHaveBeenCalledWith(
        "Custom progress message: \u001B[32m1\u001B[39m passed, \u001B[31m1\u001B[39m failed, \u001B[33m0\u001B[39m pending\n",
      );
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

    it("should not print success message when template is not provided", () => {
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestCaseResult(createTestCase("test2", "passed"));
      reporter.onTestRunEnd();

      expect(spyPrint.mock.calls.at(-2)?.[0]).toEqual(expectedProgress(2, 0, 0));
    });

    it("should not print failure message when template is not provided", () => {
      reporter.onTestCaseResult(createTestCase("test1", "failed"));
      reporter.onTestCaseResult(createTestCase("test2", "failed"));
      reporter.onTestRunEnd();

      expect(spyPrint.mock.calls.at(-2)?.[0]).toEqual(expectedProgress(0, 2, 0));
    });

    it("should not print end message when template is not provided", () => {
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestCaseResult(createTestCase("test2", "passed"));
      reporter.onTestRunEnd();

      expect(spyPrint.mock.calls.at(-2)?.[0]).toEqual(expectedProgress(2, 0, 0));
    });

    it("should print success message when template is provided", () => {
      const reporter = new TextReporter({
        success: "${colors.green(`${passedTests} passed in ${duration}s!`)}",
      });
      reporter.onInit();
      reporter.onTestModuleCollected(createTestModule(["test1", "test2"]));
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestCaseResult(createTestCase("test2", "passed"));
      reporter.onTestRunEnd();

      expect(spyPrint.mock.calls.at(-2)?.[0]).toEqual("\u001B[32m2 passed in 0s!\u001B[39m\n");
    });

    it("should print failure message when template is provided", () => {
      const reporter = new TextReporter({
        failure: "${colors.red(`${passedTests} passed, ${failedTests} failed in ${duration}s!`)}",
      });
      reporter.onInit();
      reporter.onTestModuleCollected(createTestModule(["test1", "test2"]));
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestCaseResult(
        createTestCase("test2", "failed", { message: "Test failed", name: "Error" }),
      );
      reporter.onTestRunEnd();

      expect(spyPrint.mock.calls.at(-2)?.[0]).toEqual(
        "\u001B[31m1 passed, 1 failed in 0s!\u001B[39m\n",
      );
    });

    it("should print end message when success and failure templates are provided", () => {
      const reporter = new TextReporter({
        end: "${colors.blue(`End message in ${duration}s!`)}",
        failure: "${colors.red(`${passedTests} passed, ${failedTests} failed in ${duration}s!`)}",
        success: "${colors.green(`${passedTests} passed in ${duration}s!`)}",
      });
      reporter.onInit();
      reporter.onTestModuleCollected(createTestModule(["test1", "test2"]));
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestCaseResult(createTestCase("test2", "passed"));
      reporter.onTestRunEnd();

      expect(spyPrint.mock.calls.at(-2)?.[0]).toEqual("\u001B[34mEnd message in 0s!\u001B[39m\n");
    });

    it("should print end message when not success or failure template is provided", () => {
      const reporter = new TextReporter({
        end: "${colors.blue(`End message in ${duration}s!`)}",
      });
      reporter.onInit();
      reporter.onTestModuleCollected(createTestModule(["test1", "test2"]));
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestCaseResult(
        createTestCase("test2", "failed", { message: "Test failed", name: "Error" }),
      );
      reporter.onTestRunEnd();

      expect(spyPrint.mock.calls.at(-2)?.[0]).toEqual("\u001B[34mEnd message in 0s!\u001B[39m\n");
    });

    it("should print both success and end message when both templates are provided", () => {
      const reporter = new TextReporter({
        end: "${colors.blue(`End message in ${duration}s!`)}",
        success: "${colors.green(`${passedTests} passed in ${duration}s!`)}",
      });
      reporter.onInit();
      reporter.onTestModuleCollected(createTestModule(["test1"]));
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestRunEnd();

      expect(spyPrint.mock.calls.at(-3)?.[0]).toEqual("\u001B[32m1 passed in 0s!\u001B[39m\n");
      expect(spyPrint.mock.calls.at(-2)?.[0]).toEqual("\u001B[34mEnd message in 0s!\u001B[39m\n");
    });

    it("should print both failure and end message when both templates are provided", () => {
      const reporter = new TextReporter({
        end: "${colors.blue(`End message in ${duration}s!`)}",
        failure: "${colors.red(`${passedTests} passed, ${failedTests} failed in ${duration}s!`)}",
      });
      reporter.onInit();
      reporter.onTestModuleCollected(createTestModule(["test1", "test2"]));
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestCaseResult(
        createTestCase("test2", "failed", { message: "Test failed", name: "Error" }),
      );
      reporter.onTestRunEnd();

      expect(spyPrint.mock.calls.at(-3)?.[0]).toEqual(
        "\u001B[31m1 passed, 1 failed in 0s!\u001B[39m\n",
      );
      expect(spyPrint.mock.calls.at(-2)?.[0]).toEqual("\u001B[34mEnd message in 0s!\u001B[39m\n");
    });
  });

  describe("console output order", () => {
    let reporter: TextReporter;
    let consoleCalls: { args: string[]; method: string }[];

    beforeEach(() => {
      consoleCalls = [];
      vi.spyOn(ConsoleOutput, "print").mockImplementation((...arguments_) => {
        consoleCalls.push({ args: arguments_, method: "print" });
      });
      vi.spyOn(ConsoleOutput, "clearLine").mockImplementation(() => {
        consoleCalls.push({ args: [], method: "clearLine" });
      });
      reporter = new TextReporter({
        end: "End of tests",
        failure: "${colors.red(`${passedTests} passed, ${failedTests} failed in ${duration}s!`)}",
        progress:
          "${colors.green(`${passedTests} passed`)}, ${colors.red(`${failedTests} failed`)}, ${colors.yellow(`${pendingTests} pending`)}",
        start: "Starting tests...",
        success: "${colors.green(`${passedTests} passed in ${duration}s!`)}",
      });
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it("should not clear line when printing start message", () => {
      reporter.onInit();

      expect(consoleCalls).toEqual([{ args: ["Starting tests...\n"], method: "print" }]);
    });

    it("should not clear line when printing progress updates first time without start message", () => {
      const reporter = new TextReporter();
      reporter.onInit();
      reporter.onTestModuleCollected(createTestModule(["test1"]));

      expect(consoleCalls).toEqual([{ args: [expectedProgress(0, 0, 1)], method: "print" }]);
    });

    it("should maintain start message while updating progress", () => {
      reporter.onInit();
      reporter.onTestModuleCollected(createTestModule(["test1", "test2"]));
      reporter.onTestCaseResult(createTestCase("test1", "passed"));

      expect(consoleCalls).toEqual([
        { args: ["Starting tests...\n"], method: "print" },
        { args: [expectedProgress(0, 0, 2)], method: "print" },
        { args: [], method: "clearLine" },
        { args: [expectedProgress(1, 0, 1)], method: "print" },
      ]);
    });

    it("should clear line when printing progress updates", () => {
      reporter.onInit();
      reporter.onTestModuleCollected(createTestModule(["test1", "test2"]));
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestCaseResult(
        createTestCase("test2", "failed", { message: "Test failed", name: "Error" }),
      );

      expect(consoleCalls).toEqual([
        { args: ["Starting tests...\n"], method: "print" },
        { args: [expectedProgress(0, 0, 2)], method: "print" },
        { args: [], method: "clearLine" },
        { args: [expectedProgress(1, 0, 1)], method: "print" },
        { args: [], method: "clearLine" },
        { args: [expectedProgress(1, 1, 0)], method: "print" },
      ]);
    });

    it("should clear progress updates with multiple lines", () => {
      const reporter = new TextReporter({
        progress: "passed ${passedTests}\nfailed ${failedTests}\npending ${pendingTests}",
      });
      reporter.onInit();
      reporter.onTestModuleCollected(createTestModule(["test1", "test2"]));
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestCaseResult(createTestCase("test2", "passed"));

      expect(consoleCalls).toEqual([
        { args: ["passed 0\nfailed 0\npending 2\n"], method: "print" },
        { args: [], method: "clearLine" },
        { args: ["passed 1\nfailed 0\npending 1\n"], method: "print" },
        { args: [], method: "clearLine" },
        { args: ["passed 2\nfailed 0\npending 0\n"], method: "print" },
      ]);
    });

    it("should clear progress updates when finished", () => {
      const reporter = new TextReporter({
        failure: "${colors.red(`${passedTests} passed, ${failedTests} failed in ${duration}s!`)}",
        success: "${colors.green(`${passedTests} passed in ${duration}s!`)}",
      });
      reporter.onInit();
      reporter.onTestModuleCollected(createTestModule(["test1", "test2"]));
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestCaseResult(createTestCase("test2", "passed"));
      reporter.onTestRunEnd();

      expect(consoleCalls).toEqual([
        { args: [expectedProgress(0, 0, 2)], method: "print" },
        { args: [], method: "clearLine" },
        { args: [expectedProgress(1, 0, 1)], method: "print" },
        { args: [], method: "clearLine" },
        { args: [expectedProgress(2, 0, 0)], method: "print" },
        { args: [], method: "clearLine" },
        { args: ["\u001B[32m2 passed in 0s!\u001B[39m\n"], method: "print" },
        { args: ["\n"], method: "print" },
      ]);
    });

    it("should not clear success/failure message line when printing final success message", () => {
      reporter.onInit();
      reporter.onTestModuleCollected(createTestModule(["test1"]));
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestRunEnd();

      const lastCalls = consoleCalls.slice(-3);
      expect(lastCalls).toEqual([
        { args: ["\u001B[32m1 passed in 0s!\u001B[39m\n"], method: "print" },
        { args: ["End of tests\n"], method: "print" },
        { args: ["\n"], method: "print" },
      ]);
    });

    it("should clear line only during progress updates in a complete test run", () => {
      reporter.onInit();
      reporter.onTestModuleCollected(
        createTestModule(["test1", "test2"], "module1", "/path/to/test.spec.ts"),
      );
      reporter.onTestModuleCollected(
        createTestModule(["test3", "test4"], "module2", "/path/to/test2.spec.ts"),
      );
      reporter.onTestCaseResult(createTestCase("test1", "passed"));
      reporter.onTestCaseResult(createTestCase("test2", "passed"));
      reporter.onTestCaseResult(createTestCase("test3", "passed"));
      reporter.onTestCaseResult(createTestCase("test4", "passed"));
      reporter.onTestRunEnd();

      expect(consoleCalls).toEqual([
        { args: ["Starting tests...\n"], method: "print" },
        { args: [expectedProgress(0, 0, 2)], method: "print" },
        { args: [], method: "clearLine" },
        { args: [expectedProgress(0, 0, 4)], method: "print" },
        { args: [], method: "clearLine" },
        { args: [expectedProgress(1, 0, 3)], method: "print" },
        { args: [], method: "clearLine" },
        { args: [expectedProgress(2, 0, 2)], method: "print" },
        { args: [], method: "clearLine" },
        { args: [expectedProgress(3, 0, 1)], method: "print" },
        { args: [], method: "clearLine" },
        { args: [expectedProgress(4, 0, 0)], method: "print" },
        { args: [], method: "clearLine" },
        { args: ["\u001B[32m4 passed in 0s!\u001B[39m\n"], method: "print" },
        { args: ["End of tests\n"], method: "print" },
        { args: ["\n"], method: "print" },
      ]);
    });
  });
});
