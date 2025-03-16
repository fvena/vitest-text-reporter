import type { MockInstance } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ConsoleOutput from "../../src/utils/console-output";

describe("ConsoleOutput", () => {
  let stdout: { write: MockInstance };

  beforeEach(() => {
    // Mock process.stdout.write
    stdout = {
      write: vi.fn(),
    };
    vi.stubGlobal("process", { stdout });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("clearLine", () => {
    it("should write the clear line sequence to stdout", () => {
      ConsoleOutput.clearLine();
      expect(stdout.write).toHaveBeenCalledWith("\r\u001B[K");
      expect(stdout.write).toHaveBeenCalledTimes(1);
    });

    it("should work when called multiple times", () => {
      ConsoleOutput.clearLine();
      ConsoleOutput.clearLine();
      ConsoleOutput.clearLine();
      expect(stdout.write).toHaveBeenCalledWith("\r\u001B[K");
      expect(stdout.write).toHaveBeenCalledTimes(3);
    });
  });

  describe("print", () => {
    it("should write the message to stdout", () => {
      ConsoleOutput.print("Hello World");
      expect(stdout.write).toHaveBeenCalledWith("Hello World");
      expect(stdout.write).toHaveBeenCalledTimes(1);
    });

    it("should handle empty string", () => {
      ConsoleOutput.print("");
      expect(stdout.write).toHaveBeenCalledWith("");
      expect(stdout.write).toHaveBeenCalledTimes(1);
    });

    it("should handle special characters", () => {
      const specialChars = "!@#$%^&*()_+-=[]{}|;:'\",.<>?/\\";
      ConsoleOutput.print(specialChars);
      expect(stdout.write).toHaveBeenCalledWith(specialChars);
      expect(stdout.write).toHaveBeenCalledTimes(1);
    });

    it("should handle multi-line strings", () => {
      const multiLine = "Line 1\nLine 2\nLine 3";
      ConsoleOutput.print(multiLine);
      expect(stdout.write).toHaveBeenCalledWith(multiLine);
      expect(stdout.write).toHaveBeenCalledTimes(1);
    });

    it("should handle unicode characters", () => {
      const unicode = "Hello 👋 World 🌍";
      ConsoleOutput.print(unicode);
      expect(stdout.write).toHaveBeenCalledWith(unicode);
      expect(stdout.write).toHaveBeenCalledTimes(1);
    });
  });

  describe("integration", () => {
    it("should work when combining clearLine and print", () => {
      ConsoleOutput.clearLine();
      ConsoleOutput.print("New content");

      expect(stdout.write).toHaveBeenCalledTimes(2);
      expect(stdout.write).toHaveBeenNthCalledWith(1, "\r\u001B[K");
      expect(stdout.write).toHaveBeenNthCalledWith(2, "New content");
    });

    it("should handle multiple operations in sequence", () => {
      ConsoleOutput.print("First line");
      ConsoleOutput.clearLine();
      ConsoleOutput.print("Second line");
      ConsoleOutput.clearLine();
      ConsoleOutput.print("Final line");

      expect(stdout.write).toHaveBeenCalledTimes(5);
      expect(stdout.write).toHaveBeenNthCalledWith(1, "First line");
      expect(stdout.write).toHaveBeenNthCalledWith(2, "\r\u001B[K");
      expect(stdout.write).toHaveBeenNthCalledWith(3, "Second line");
      expect(stdout.write).toHaveBeenNthCalledWith(4, "\r\u001B[K");
      expect(stdout.write).toHaveBeenNthCalledWith(5, "Final line");
    });
  });
});
