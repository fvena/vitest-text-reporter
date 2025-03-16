import type { Reporter, TestCase, TestModule } from "vitest/node";
import type { Templates, TextReporterOptions } from "./types";
import { DEFAULT_TEMPLATES } from "./constants";
import { Tracker } from "./utils/tracker";
import ConsoleOutput from "./utils/console-output";
import Formatter from "./utils/formatter";

export default class TextReporter implements Reporter {
  private tracker: Tracker;
  private templates: Templates;

  constructor(options?: Partial<TextReporterOptions>) {
    this.tracker = new Tracker();
    this.templates = {
      ...DEFAULT_TEMPLATES,
      ...options,
    };
  }

  /**
   * Reporter method called when the test run starts
   * Initializes the test statistics and prints the start message
   */
  onInit(): void {
    this.tracker.initStats();

    if (this.templates.start) {
      const data = this.tracker.getStats();
      const message = Formatter.format(this.templates.start, data);
      ConsoleOutput.print(message);
    }
  }

  /**
   * Reporter method called when a test module is collected
   * Registers the test module and its tests in the tracker
   */
  onTestModuleCollected(testModule: TestModule): void {
    const fileId = testModule.id;
    const fileName = testModule.moduleId.split("/").pop() ?? fileId;

    // Initialize the file first
    this.tracker.initializeFile(fileId, fileName);

    // Register all tests in the module
    for (const test of testModule.children.allTests()) {
      this.tracker.registerTest(test.id, fileId);
    }

    // Update progress after registering tests
    this.updateProgress();
  }

  /**
   * Reporter method called when a test case result is available
   * Updates the test state based on the test result and prints the progress message
   */
  onTestCaseResult = (testCase: TestCase): void => {
    const result = testCase.result();
    if (result.state === "passed" || result.state === "failed") {
      this.tracker.updateTestState(testCase.id, result.state === "passed" ? "pass" : "fail");
      this.updateProgress();
    }
  };

  /**
   * Reporter method called when the test run ends
   * Prints the end message after the test run
   */
  onTestRunEnd(): void {
    const data = this.tracker.getStats(true);
    const message =
      data.failedTests > 0
        ? Formatter.format(this.templates.failure, data)
        : Formatter.format(this.templates.success, data);
    ConsoleOutput.print(message);
  }

  /**
   * Updates the progress message during test execution
   */
  private updateProgress(): void {
    const data = this.tracker.getStats();
    const message = Formatter.format(this.templates.progress, data);
    ConsoleOutput.clearLine();
    ConsoleOutput.print(message);
  }
}
