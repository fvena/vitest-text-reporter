import type { TestCase, TestModule } from "vitest/node";
import type { MockInstance } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CustomReporter from "./text-reporter";

describe("CustomReporter", () => {
  let reporter: CustomReporter;
  let stdout: { write: MockInstance };
  let consoleLog: MockInstance;

  beforeEach(() => {
    // Mock process.stdout.write
    stdout = {
      write: vi.fn(),
    };
    vi.stubGlobal("process", { stdout });

    // Mock console.log
    consoleLog = vi.spyOn(console, "log").mockImplementation(() => {
      // Do nothing
    });

    // Create reporter instance with colors disabled for easier testing
    reporter = new CustomReporter({ colors: false });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with default templates", () => {
    expect(reporter).toBeDefined();
  });

  it("should display start message on init", () => {
    reporter.onInit();
    expect(consoleLog).toHaveBeenCalledWith("Running tests...");
  });

  it("should collect test module information", () => {
    const testModule = {
      children: {
        allTests: function* () {
          yield {
            diagnostic: undefined,
            fullName: "test-file-1 test 1",
            id: "test-1",
            location: { column: 1, file: "/path/to/test-file-1.test.ts", line: 2 },
            meta: {},
            module: {} as TestModule,
            name: "test 1",
            ok: true,
            options: {},
            parent: {} as TestModule,
            project: {},
            result: () => ({ state: "passed" }),
            state: "running",
            suite: {} as TestModule,
            tasks: [],
            type: "test",
          } as unknown as TestCase;
          yield {
            diagnostic: undefined,
            fullName: "test-file-1 test 2",
            id: "test-2",
            location: { column: 1, file: "/path/to/test-file-1.test.ts", line: 3 },
            meta: {},
            module: {} as TestModule,
            name: "test 2",
            ok: true,
            options: {},
            parent: {} as TestModule,
            project: {},
            result: () => ({ state: "passed" }),
            state: "running",
            suite: {} as TestModule,
            tasks: [],
            type: "test",
          } as unknown as TestCase;
        },
      },
      diagnostic: undefined,
      errors: [],
      fullName: "test-file-1",
      id: "test-file-1",
      location: { column: 1, file: "/path/to/test-file-1.test.ts", line: 1 },
      meta: {},
      moduleId: "/path/to/test-file-1.test.ts",
      name: "test-file-1",
      ok: true,
      project: {},
      state: "running",
      type: "suite",
    } as unknown as TestModule;

    reporter.onTestModuleCollected(testModule);
    reporter.onTestCaseResult({
      diagnostic: undefined,
      fullName: "test-file-1 test 1",
      id: "test-1",
      location: { column: 1, file: "/path/to/test-file-1.test.ts", line: 2 },
      meta: {},
      module: {} as TestModule,
      name: "test 1",
      ok: true,
      options: {},
      parent: {} as TestModule,
      project: {},
      result: () => ({ state: "passed" }),
      state: "running",
      suite: {} as TestModule,
      tasks: [],
      type: "test",
    } as unknown as TestCase);

    expect(stdout.write).toHaveBeenCalled();
  });

  it("should handle test case results", () => {
    const testModule = {
      children: {
        allTests: function* () {
          yield {
            diagnostic: undefined,
            fullName: "test-file-1 test 1",
            id: "test-1",
            location: { column: 1, file: "/path/to/test-file-1.test.ts", line: 2 },
            meta: {},
            module: {} as TestModule,
            name: "test 1",
            ok: true,
            options: {},
            parent: {} as TestModule,
            project: {},
            result: () => ({ state: "passed" }),
            state: "running",
            suite: {} as TestModule,
            tasks: [],
            type: "test",
          } as unknown as TestCase;
        },
      },
      diagnostic: undefined,
      errors: [],
      fullName: "test-file-1",
      id: "test-file-1",
      location: { column: 1, file: "/path/to/test-file-1.test.ts", line: 1 },
      meta: {},
      moduleId: "/path/to/test-file-1.test.ts",
      name: "test-file-1",
      ok: true,
      project: {},
      state: "running",
      type: "suite",
    } as unknown as TestModule;

    reporter.onTestModuleCollected(testModule);

    // Test passing case
    reporter.onTestCaseResult({
      diagnostic: undefined,
      fullName: "test-file-1 test 1",
      id: "test-1",
      location: { column: 1, file: "/path/to/test-file-1.test.ts", line: 2 },
      meta: {},
      module: {} as TestModule,
      name: "test 1",
      ok: true,
      options: {},
      parent: {} as TestModule,
      project: {},
      result: () => ({ state: "passed" }),
      state: "running",
      suite: {} as TestModule,
      tasks: [],
      type: "test",
    } as unknown as TestCase);

    expect(stdout.write).toHaveBeenCalled();

    // Test failing case
    reporter.onTestCaseResult({
      diagnostic: undefined,
      fullName: "test-file-1 test 1",
      id: "test-1",
      location: { column: 1, file: "/path/to/test-file-1.test.ts", line: 2 },
      meta: {},
      module: {} as TestModule,
      name: "test 1",
      ok: false,
      options: {},
      parent: {} as TestModule,
      project: {},
      result: () => ({ state: "failed" }),
      state: "running",
      suite: {} as TestModule,
      tasks: [],
      type: "test",
    } as unknown as TestCase);

    expect(stdout.write).toHaveBeenCalled();
  });

  it("should display final summary on test run end", () => {
    const testModule = {
      children: {
        allTests: function* () {
          yield {
            diagnostic: undefined,
            fullName: "test-file-1 test 1",
            id: "test-1",
            location: { column: 1, file: "/path/to/test-file-1.test.ts", line: 2 },
            meta: {},
            module: {} as TestModule,
            name: "test 1",
            ok: true,
            options: {},
            parent: {} as TestModule,
            project: {},
            result: () => ({ state: "passed" }),
            state: "running",
            suite: {} as TestModule,
            tasks: [],
            type: "test",
          } as unknown as TestCase;
        },
      },
      diagnostic: undefined,
      errors: [],
      fullName: "test-file-1",
      id: "test-file-1",
      location: { column: 1, file: "/path/to/test-file-1.test.ts", line: 1 },
      meta: {},
      moduleId: "/path/to/test-file-1.test.ts",
      name: "test-file-1",
      ok: true,
      project: {},
      state: "running",
      type: "suite",
    } as unknown as TestModule;

    reporter.onTestModuleCollected(testModule);
    reporter.onTestCaseResult({
      diagnostic: undefined,
      fullName: "test-file-1 test 1",
      id: "test-1",
      location: { column: 1, file: "/path/to/test-file-1.test.ts", line: 2 },
      meta: {},
      module: {} as TestModule,
      name: "test 1",
      ok: true,
      options: {},
      parent: {} as TestModule,
      project: {},
      result: () => ({ state: "passed" }),
      state: "running",
      suite: {} as TestModule,
      tasks: [],
      type: "test",
    } as unknown as TestCase);
    reporter.onTestRunEnd();

    expect(stdout.write).toHaveBeenCalled();
  });
});
