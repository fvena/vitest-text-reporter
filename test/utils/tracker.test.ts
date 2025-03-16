import type { TestState } from "../../src/types";
import { beforeEach, describe, expect, it } from "vitest";
import { Tracker } from "../../src/utils/tracker";

describe("Tracker", () => {
  let tracker: Tracker;

  beforeEach(() => {
    tracker = new Tracker();
    tracker.initStats();
  });

  describe("initStats", () => {
    it("should initialize start time", () => {
      const beforeInit = Date.now();
      tracker.initStats();
      const stats = tracker.getStats();
      expect(stats.startTime).toBeGreaterThanOrEqual(beforeInit);
      expect(stats.startTime).toBeLessThanOrEqual(Date.now());
    });
  });

  describe("initializeFile", () => {
    it("should initialize a new file with correct initial stats", () => {
      tracker.initializeFile("file1", "test.spec.ts");
      const stats = tracker.getFileStats();
      expect(stats).toEqual({
        failedFiles: 0,
        passedFiles: 1, // No tests registered yet, so it counts as passed
        pendingFiles: 0,
        totalFiles: 1,
      });
    });

    it("should handle multiple files", () => {
      tracker.initializeFile("file1", "test1.spec.ts");
      tracker.initializeFile("file2", "test2.spec.ts");
      const stats = tracker.getFileStats();
      expect(stats).toEqual({
        failedFiles: 0,
        passedFiles: 2,
        pendingFiles: 0,
        totalFiles: 2,
      });
    });
  });

  describe("registerTest", () => {
    beforeEach(() => {
      tracker.initializeFile("file1", "test.spec.ts");
    });

    it("should register a test as pending", () => {
      tracker.registerTest("test1", "file1");
      const stats = tracker.getTestStats();
      expect(stats).toEqual({
        failedTests: 0,
        passedTests: 0,
        pendingTests: 1,
        totalTests: 1,
      });
    });

    it("should update file stats when registering a test", () => {
      tracker.registerTest("test1", "file1");
      const fileStats = tracker.getFileStats();
      expect(fileStats).toEqual({
        failedFiles: 0,
        passedFiles: 0,
        pendingFiles: 1,
        totalFiles: 1,
      });
    });

    it("should handle multiple tests for the same file", () => {
      tracker.registerTest("test1", "file1");
      tracker.registerTest("test2", "file1");
      const stats = tracker.getTestStats();
      expect(stats).toEqual({
        failedTests: 0,
        passedTests: 0,
        pendingTests: 2,
        totalTests: 2,
      });
    });
  });

  describe("updateTestState", () => {
    beforeEach(() => {
      tracker.initializeFile("file1", "test.spec.ts");
      tracker.registerTest("test1", "file1");
    });

    it.each<[TestState, TestState]>([
      ["pending", "pass"],
      ["pending", "fail"],
      ["pass", "fail"],
      ["fail", "pass"],
    ])("should update test state from %s to %s", (fromState, toState) => {
      if (fromState !== "pending") {
        tracker.updateTestState("test1", fromState);
      }
      tracker.updateTestState("test1", toState);

      const stats = tracker.getTestStats();
      const expectedStats = {
        failedTests: toState === "fail" ? 1 : 0,
        passedTests: toState === "pass" ? 1 : 0,
        pendingTests: toState === "pending" ? 1 : 0,
        totalTests: 1,
      };
      expect(stats).toEqual(expectedStats);
    });

    it("should handle non-existent test IDs gracefully", () => {
      tracker.updateTestState("nonexistent", "pass");
      const stats = tracker.getTestStats();
      expect(stats).toEqual({
        failedTests: 0,
        passedTests: 0,
        pendingTests: 1,
        totalTests: 1,
      });
    });

    it("should handle non-existent file IDs gracefully", () => {
      tracker.registerTest("test2", "nonexistent");
      tracker.updateTestState("test2", "pass");
      const stats = tracker.getTestStats();
      expect(stats).toEqual({
        failedTests: 0,
        passedTests: 0,
        pendingTests: 1,
        totalTests: 2,
      });
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
      expect(stats).toMatchObject({
        failedFiles: 1,
        failedTests: 1,
        passedFiles: 0,
        passedTests: 1,
        pendingFiles: 1,
        pendingTests: 1,
        totalFiles: 2,
        totalTests: 3,
      });
      expect(stats.elapsedTime).toBeGreaterThanOrEqual(0);
      expect(stats.startTime).toBeLessThanOrEqual(Date.now());
      expect(stats.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it("should include endTime and totalTime when end parameter is true", () => {
      const stats = tracker.getStats(true);
      expect(stats.endTime).toBeDefined();
      expect(stats.endTime).toBeLessThanOrEqual(Date.now());
      expect(stats.endTime).toBeGreaterThanOrEqual(stats.startTime);
      expect(stats.totalTime).toBeDefined();
      if (stats.endTime === undefined) {
        throw new Error("endTime should be defined when end parameter is true");
      }
      expect(stats.totalTime).toBe(Math.round((stats.endTime - stats.startTime) / 1000));
    });

    it("should not include endTime or totalTime when end parameter is false", () => {
      const stats = tracker.getStats(false);
      expect(stats.endTime).toBeUndefined();
      expect(stats.totalTime).toBeUndefined();
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
      expect(tracker.getTestStats()).toEqual({
        failedTests: 0,
        passedTests: 0,
        pendingTests: 4,
        totalTests: 4,
      });

      // Update test states
      tracker.updateTestState("test1", "pass");
      tracker.updateTestState("test2", "pass");
      tracker.updateTestState("test3", "fail");
      tracker.updateTestState("test4", "pass");

      // Final state check
      const finalStats = tracker.getStats(true);
      expect(finalStats).toMatchObject({
        failedFiles: 1,
        failedTests: 1,
        passedFiles: 1,
        passedTests: 3,
        pendingFiles: 0,
        pendingTests: 0,
        totalFiles: 2,
        totalTests: 4,
      });
    });

    it("should handle state transitions correctly", () => {
      tracker.initializeFile("file1", "test.spec.ts");
      tracker.registerTest("test1", "file1");

      // Pending -> Pass -> Fail -> Pass
      expect(tracker.getTestStats().pendingTests).toBe(1);

      tracker.updateTestState("test1", "pass");
      expect(tracker.getTestStats().passedTests).toBe(1);
      expect(tracker.getTestStats().pendingTests).toBe(0);

      tracker.updateTestState("test1", "fail");
      expect(tracker.getTestStats().failedTests).toBe(1);
      expect(tracker.getTestStats().passedTests).toBe(0);

      tracker.updateTestState("test1", "pass");
      expect(tracker.getTestStats().passedTests).toBe(1);
      expect(tracker.getTestStats().failedTests).toBe(0);
    });
  });
});
