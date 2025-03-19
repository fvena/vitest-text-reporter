import { beforeEach, describe, expect, it, vi } from "vitest";
import { Tracker } from "../../src/utils/tracker";

describe("Tracker", () => {
  let tracker: Tracker;
  let mockDate: number;

  beforeEach(() => {
    tracker = new Tracker();
    tracker.initStats();

    // Mock Date.now() for consistent timestamps
    mockDate = 1_000_000_000_000;
    vi.spyOn(Date, "now").mockImplementation(() => mockDate);
  });

  describe("initStats", () => {
    it("should clear all stats", () => {
      // Add some stats
      tracker.initializeFile("file1", "test.spec.ts");

      // Reset stats
      tracker.initStats();
      const stats = tracker.getStats();
      expect(stats).toEqual({
        duration: 0,
        failedFiles: 0,
        failedTests: 0,
        passedFiles: 0,
        passedTests: 0,
        pendingFiles: 0,
        pendingTests: 0,
        startTime: mockDate,
        timestamp: mockDate,
        totalFiles: 0,
        totalTests: 0,
      });
    });
  });

  describe("initializeFile", () => {
    it("should initialize a new file with correct initial stats", () => {
      tracker.initializeFile("file1", "test.spec.ts");
      const stats = tracker.getStats();
      expect(stats).toEqual({
        duration: 0,
        failedFiles: 0,
        failedTests: 0,
        passedFiles: 0,
        passedTests: 0,
        pendingFiles: 1, // When a file is initialized, it's pending
        pendingTests: 0,
        startTime: mockDate,
        timestamp: mockDate,
        totalFiles: 1,
        totalTests: 0,
      });
    });

    it("should handle multiple files", () => {
      tracker.initializeFile("file1", "test1.spec.ts");
      tracker.initializeFile("file2", "test2.spec.ts");
      const stats = tracker.getStats();
      expect(stats).toEqual({
        duration: 0,
        failedFiles: 0,
        failedTests: 0,
        passedFiles: 0,
        passedTests: 0,
        pendingFiles: 2,
        pendingTests: 0,
        startTime: mockDate,
        timestamp: mockDate,
        totalFiles: 2,
        totalTests: 0,
      });
    });
  });

  describe("registerTest", () => {
    beforeEach(() => {
      tracker.initializeFile("file1", "test.spec.ts");
    });

    it("should register a test as pending", () => {
      tracker.registerTest("test1", "file1");
      const stats = tracker.getStats();
      expect(stats).toEqual({
        duration: 0,
        failedFiles: 0,
        failedTests: 0,
        passedFiles: 0,
        passedTests: 0,
        pendingFiles: 1,
        pendingTests: 1,
        startTime: mockDate,
        timestamp: mockDate,
        totalFiles: 1,
        totalTests: 1,
      });
    });

    it("should handle multiple tests for the same file", () => {
      tracker.registerTest("test1", "file1");
      tracker.registerTest("test2", "file1");
      const stats = tracker.getStats();
      expect(stats).toEqual({
        duration: 0,
        failedFiles: 0,
        failedTests: 0,
        passedFiles: 0,
        passedTests: 0,
        pendingFiles: 1,
        pendingTests: 2,
        startTime: mockDate,
        timestamp: mockDate,
        totalFiles: 1,
        totalTests: 2,
      });
    });

    it("should throw an error if the file ID is not found", () => {
      expect(() => {
        tracker.registerTest("test1", "nonexistent");
      }).toThrow("File nonexistent not found");
    });
  });

  describe("updateTestState", () => {
    beforeEach(() => {
      tracker.initializeFile("file1", "test.spec.ts");
      tracker.registerTest("test1", "file1");
    });

    it("should update test state from pending to pass", () => {
      tracker.updateTestState("test1", "pass");
      const stats = tracker.getStats();
      expect(stats).toEqual({
        duration: 0,
        failedFiles: 0,
        failedTests: 0,
        passedFiles: 1,
        passedTests: 1,
        pendingFiles: 0,
        pendingTests: 0,
        startTime: mockDate,
        timestamp: mockDate,
        totalFiles: 1,
        totalTests: 1,
      });
    });

    it("should update test state from pending to fail", () => {
      tracker.updateTestState("test1", "fail");
      const stats = tracker.getStats();
      expect(stats).toEqual({
        duration: 0,
        failedFiles: 1,
        failedTests: 1,
        passedFiles: 0,
        passedTests: 0,
        pendingFiles: 0,
        pendingTests: 0,
        startTime: mockDate,
        timestamp: mockDate,
        totalFiles: 1,
        totalTests: 1,
      });
    });

    it("should not update test state if the new state is not 'fail' or 'pass'", () => {
      tracker.updateTestState("test1", "pending");
      const stats = tracker.getStats();
      expect(stats).toEqual({
        duration: 0,
        failedFiles: 0,
        failedTests: 0,
        passedFiles: 0,
        passedTests: 0,
        pendingFiles: 1,
        pendingTests: 1,
        startTime: mockDate,
        timestamp: mockDate,
        totalFiles: 1,
        totalTests: 1,
      });
    });

    it("should not update test state if the test is not pending", () => {
      tracker.updateTestState("test1", "pass");
      tracker.updateTestState("test1", "fail");
      const stats = tracker.getStats();
      expect(stats).toEqual({
        duration: 0,
        failedFiles: 0,
        failedTests: 0,
        passedFiles: 1,
        passedTests: 1,
        pendingFiles: 0,
        pendingTests: 0,
        startTime: mockDate,
        timestamp: mockDate,
        totalFiles: 1,
        totalTests: 1,
      });
    });

    it("should not update test stats if the state is the same", () => {
      tracker.updateTestState("test1", "pass");
      tracker.updateTestState("test1", "pass");
      const stats = tracker.getStats();
      expect(stats).toEqual({
        duration: 0,
        failedFiles: 0,
        failedTests: 0,
        passedFiles: 1,
        passedTests: 1,
        pendingFiles: 0,
        pendingTests: 0,
        startTime: mockDate,
        timestamp: mockDate,
        totalFiles: 1,
        totalTests: 1,
      });
    });

    it("should throw an error if the test ID is not found", () => {
      expect(() => {
        tracker.updateTestState("test2", "pass");
      }).toThrow("Test test2 not found");
    });
  });

  describe("getStats", () => {
    beforeEach(() => {
      tracker.initializeFile("file1", "test1.spec.ts");
      tracker.initializeFile("file2", "test2.spec.ts");
      tracker.registerTest("test1", "file1");
      tracker.registerTest("test2", "file1");
      tracker.registerTest("test3", "file2");
    });

    it("should return correct stats during test run", () => {
      tracker.updateTestState("test1", "pass");
      tracker.updateTestState("test2", "fail");

      const stats = tracker.getStats();
      expect(stats).toEqual({
        duration: 0,
        failedFiles: 1,
        failedTests: 1,
        passedFiles: 0,
        passedTests: 1,
        pendingFiles: 1,
        pendingTests: 1,
        startTime: mockDate,
        timestamp: mockDate,
        totalFiles: 2,
        totalTests: 3,
      });
      expect(stats.startTime).toBeDefined();
      expect(stats.timestamp).toBeDefined();
      expect(stats.duration).toBeGreaterThanOrEqual(0);
    });

    it("should include endTime when end parameter is true", () => {
      const stats = tracker.getStats(true);

      expect(stats.endTime).toBeDefined();
    });

    it("should not include endTime when end parameter is false", () => {
      const stats = tracker.getStats(false);
      expect(stats.endTime).toBeUndefined();
    });
  });

  describe("Complex scenarios", () => {
    it("should handle a complete test run with multiple files and state changes", () => {
      // Initialize files
      tracker.initializeFile("file1", "test1.spec.ts");
      tracker.initializeFile("file2", "test2.spec.ts");

      // Register tests
      tracker.registerTest("test1", "file1");
      tracker.registerTest("test2", "file1");
      tracker.registerTest("test3", "file2");
      tracker.registerTest("test4", "file2");

      // Initial state check
      expect(tracker.getStats()).toEqual({
        duration: 0,
        failedFiles: 0,
        failedTests: 0,
        passedFiles: 0,
        passedTests: 0,
        pendingFiles: 2,
        pendingTests: 4,
        startTime: mockDate,
        timestamp: mockDate,
        totalFiles: 2,
        totalTests: 4,
      });

      // Update test states
      tracker.updateTestState("test1", "pass");
      tracker.updateTestState("test2", "pass");
      tracker.updateTestState("test3", "fail");
      tracker.updateTestState("test4", "pass");

      // Final state check
      const finalStats = tracker.getStats(true);
      expect(finalStats).toEqual({
        duration: 0,
        endTime: mockDate,
        failedFiles: 1,
        failedTests: 1,
        passedFiles: 1,
        passedTests: 3,
        pendingFiles: 0,
        pendingTests: 0,
        startTime: mockDate,
        timestamp: mockDate,
        totalFiles: 2,
        totalTests: 4,
      });
    });
  });
});
