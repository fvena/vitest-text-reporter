import type { Reporter, TestCase, TestModule } from "vitest/node";
import type { Templates, TextReporterOptions } from "./types";
import { DEFAULT_TEMPLATES } from "./constants";
import { Tracker } from "./utils/tracker";
import ConsoleOutput from "./utils/console-output";
import Formatter from "./utils/formatter";

export default class TextReporter implements Reporter {
  private tracker: Tracker;
  private templates: Templates;
  private cleanLine = false;
  private progressMessageRows = 0;
  private startMessageRows = 0;

  constructor(options?: Partial<TextReporterOptions>) {
    this.tracker = new Tracker();
    this.templates = {
      ...DEFAULT_TEMPLATES,
      ...options,
    };
    this.progressMessageRows = this.templates.progress.split("\n").length + 1;
    this.startMessageRows = this.templates.start?.split("\n").length ?? 0;
  }

  /**
   * Reporter method called when the test run starts
   * Initializes the test statistics and prints the start message
   */
  onInit(): void {
    this.tracker.initStats();

    // Print start message if a start template is provided
    if (this.templates.start) {
      const data = this.tracker.getStats();
      const message = Formatter.format(this.templates.start, data);
      ConsoleOutput.print(message + "\n");
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
    this.updateProgress(this.cleanLine);

    this.cleanLine = true;
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

    // Calculate rows to clear based on clearOnEnd mode
    let rowsToClear = 0;
    if (
      this.templates.clearOnEnd === "progress" ||
      this.templates.clearOnEnd === "progress-start"
    ) {
      rowsToClear += this.progressMessageRows;
    }
    if (this.templates.clearOnEnd === "progress-start") {
      rowsToClear += this.startMessageRows;
    }

    // Clear messages if configured
    if (rowsToClear > 0) {
      ConsoleOutput.clearLine(rowsToClear);
    }

    // Print failure message if there are failed tests and a failure template is provided
    if (data.failedTests > 0 && this.templates.failure) {
      const message = Formatter.format(this.templates.failure, data);
      ConsoleOutput.print(message + "\n");
    }

    // Print success message if there are no failed tests and a success template is provided
    if (data.failedTests === 0 && this.templates.success) {
      const message = Formatter.format(this.templates.success, data);
      ConsoleOutput.print(message + "\n");
    }

    // Print end message if a end template is provided
    if (this.templates.end) {
      const message = Formatter.format(this.templates.end, data);
      ConsoleOutput.print(message + "\n");
    }

    ConsoleOutput.print("\n");
  }

  /**
   * Updates the progress message during test execution
   */
  private updateProgress(cleanLine = true): void {
    if (cleanLine) ConsoleOutput.clearLine(this.progressMessageRows);
    const data = this.tracker.getStats();
    const message = Formatter.format(this.templates.progress, data);
    ConsoleOutput.print(message + "\n");
  }
}
