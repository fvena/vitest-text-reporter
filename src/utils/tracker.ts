import type { FileStats, TemplateData, TestInfo, TestState, TestStats, TimeData } from "../types";

/**
 * Service class to handle test statistics and state management
 */
export class Tracker {
  private tests = new Map<string, TestInfo>();
  private files = new Map<string, FileStats>();
  private startTime = 0;

  /**
   * Initializes the test statistics
   */
  public initStats(): void {
    this.startTime = Date.now();
    this.tests.clear();
    this.files.clear();
  }

  /**
   * Initializes a new file's statistics
   */
  public initializeFile(fileId: string, fileName: string): void {
    this.files.set(fileId, {
      failedTests: 0,
      name: fileName,
      passedTests: 0,
      pendingTests: 0,
    });
  }

  /**
   * Registers a new test for a file
   */
  public registerTest(testId: string, fileId: string): void {
    const fileStats = this.files.get(fileId);

    if (!fileStats) {
      throw new Error(`File ${fileId} not found`);
    }

    this.tests.set(testId, {
      fileId,
      state: "pending", // When a test is registered, it's pending
    });

    fileStats.pendingTests++;
  }

  /**
   * Updates the state of a test and its file's statistics
   *
   * IMPORTANT NOTE: This method contains multiple validations to handle a specific
   * case in the test execution environment: the same test may receive multiple
   * update calls with the same state. These validations prevent counters from
   * being incremented or decremented multiple times, which would cause incorrect
   * statistics.
   *
   * The validations ensure that:
   * 1. We only accept changes to "fail" or "pass" states
   * 2. We only allow one state change per test (from "pending")
   * 3. Counters are updated exactly once per test
   */
  public updateTestState(testId: string, newState: TestState): void {
    if (newState !== "fail" && newState !== "pass") return;

    const testInfo = this.tests.get(testId);
    if (!testInfo) {
      throw new Error(`Test ${testId} not found`);
    }

    const oldState = testInfo.state;
    if (oldState === newState || oldState !== "pending") return;

    const fileStats = this.files.get(testInfo.fileId);
    if (!fileStats) {
      throw new Error(`File ${testInfo.fileId} not found`);
    }

    // Update file counters
    if (newState === "fail") fileStats.failedTests++;
    else fileStats.passedTests++;
    fileStats.pendingTests--;

    // Update test state
    testInfo.state = newState;
  }

  /**
   * Gets the total test statistics
   */
  private getTestStats(): TestStats {
    // Initialize counters for tests
    let passedTests = 0;
    let failedTests = 0;
    let pendingTests = 0;

    // Initialize counters for files
    let passedFiles = 0;
    let failedFiles = 0;
    let pendingFiles = 0;

    for (const file of this.files.values()) {
      passedTests += file.passedTests;
      failedTests += file.failedTests;
      pendingTests += file.pendingTests;

      if (file.failedTests > 0) failedFiles++;
      else if (file.passedTests > 0) passedFiles++;
      else pendingFiles++;
    }

    return {
      failedFiles,
      failedTests,
      passedFiles,
      passedTests,
      pendingFiles,
      pendingTests,
      totalFiles: this.files.size,
      totalTests: this.tests.size,
    };
  }

  /**
   * Gets the time statistics
   */
  private getTimeStats(): TimeData {
    const now = Date.now();

    return {
      duration: Math.round((now - this.startTime) / 1000), // seconds
      startTime: this.startTime,
      timestamp: now,
    };
  }

  /**
   * Gets the stats for the current test run
   */
  public getStats(end = false): TemplateData {
    const data: TemplateData = {
      ...this.getTestStats(),
      ...this.getTimeStats(),
    };

    if (end) {
      data.endTime = Date.now();
    }

    return data;
  }
}
