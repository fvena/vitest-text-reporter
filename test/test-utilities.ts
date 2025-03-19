import type { TestCase, TestModule, TestResult } from "vitest/node";

/**
 * Create a minimal TestModule to create a test module with a list of test
 *
 * @param testIds - The list of test IDs to include in the test module
 * @param id - The ID of the test module
 * @param moduleId - The ID of the test module
 * @returns A TestModule object
 */
export const createTestModule = (
  testIds: string[],
  id = "module1",
  moduleId = "/path/to/test.spec.ts",
): TestModule =>
  ({
    children: {
      *allTests(
        state?: "failed" | "passed" | "pending" | "skipped",
      ): Generator<TestCase, undefined, void> {
        for (const testId of testIds) {
          const test: TestCase = {
            id: testId,
            result: () => ({ state: "pending" }) as TestResult,
          } as TestCase;

          if (!state || test.result().state === state) {
            yield test;
          }
        }
        return undefined;
      },
    } as unknown as TestModule["children"],
    id,
    moduleId,
  }) as TestModule;

/**
 * Create a TestCase with a specific state and optional error
 * @param id - The ID of the test case
 * @param state - The state of the test case
 * @param error - The error of the test case
 * @returns A TestCase object
 */
export const createTestCase = (
  id: string,
  state: "failed" | "passed" | "pending" | "skipped" = "pending",
  error?: { message: string; name: string },
): TestCase =>
  ({
    id,
    result: () =>
      ({
        duration: 0,
        errors: state === "failed" ? [error ?? { message: "Test failed", name: "Error" }] : [],
        retryCount: 0,
        state,
      }) as TestResult,
  }) as TestCase;
