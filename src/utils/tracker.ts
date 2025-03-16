import type {
  FileStats,
  FileStatsResult,
  TemplateData,
  TestInfo,
  TestState,
  TestStats,
} from "../types";

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
  }

  /**
   * Initializes a new file's statistics
   */
  public initializeFile(fileId: string, fileName: string): void {
    this.files.set(fileId, {
      failed: 0,
      name: fileName,
      passed: 0,
      pending: 0,
    });
  }

  /**
   * Registers a new test for a file
   */
  public registerTest(testId: string, fileId: string): void {
    this.tests.set(testId, {
      fileId,
      state: "pending",
    });

    const fileStats = this.files.get(fileId);
    if (fileStats) {
      fileStats.pending++;
    }
  }

  /**
   * Updates the state of a test and its file's statistics
   */
  public updateTestState(testId: string, newState: TestState): void {
    const testInfo = this.tests.get(testId);
    if (!testInfo) return;

    const fileStats = this.files.get(testInfo.fileId);
    if (!fileStats) return;

    const oldState = testInfo.state;

    // Update file counters
    this.decrementCounter(fileStats, oldState);
    this.incrementCounter(fileStats, newState);

    // Update test state
    testInfo.state = newState;
  }

  /**
   * Gets the total test statistics
   */
  public getTestStats(): TestStats {
    let passedTests = 0;
    let failedTests = 0;
    let pendingTests = 0;

    for (const fileStats of this.files.values()) {
      passedTests += fileStats.passed;
      failedTests += fileStats.failed;
      pendingTests += fileStats.pending;
    }

    return {
      failedTests,
      passedTests,
      pendingTests,
      totalTests: this.tests.size,
    };
  }

  /**
   * Gets the file statistics
   */
  public getFileStats(): FileStatsResult {
    let passedFiles = 0;
    let failedFiles = 0;
    let pendingFiles = 0;

    for (const stats of this.files.values()) {
      if (stats.failed > 0) {
        failedFiles++;
      } else if (stats.pending > 0) {
        pendingFiles++;
      } else {
        passedFiles++;
      }
    }

    return {
      failedFiles,
      passedFiles,
      pendingFiles,
      totalFiles: this.files.size,
    };
  }

  /**
   * Gets the stats for the current test run
   */
  public getStats(end = false): TemplateData {
    const data: TemplateData = {
      ...this.getTestStats(),
      ...this.getFileStats(),
      elapsedTime: Math.round((Date.now() - this.startTime) / 1000), // seconds
      startTime: this.startTime,
      timestamp: Date.now(),
    };

    if (end) {
      data.endTime = Date.now();
      data.totalTime = Math.round((data.endTime - this.startTime) / 1000); // seconds
    }

    return data;
  }

  private decrementCounter(fileStats: FileStats, state: TestState): void {
    switch (state) {
      case "fail": {
        fileStats.failed--;
        break;
      }
      case "pass": {
        fileStats.passed--;
        break;
      }
      case "pending": {
        fileStats.pending--;
        break;
      }
    }
  }

  private incrementCounter(fileStats: FileStats, state: TestState): void {
    switch (state) {
      case "fail": {
        fileStats.failed++;
        break;
      }
      case "pass": {
        fileStats.passed++;
        break;
      }
      case "pending": {
        fileStats.pending++;
        break;
      }
    }
  }
}
