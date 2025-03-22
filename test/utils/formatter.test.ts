import type { TemplateData } from "../../src/types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Formatter from "../../src/utils/formatter";

// Mock for yoctocolors
vi.mock("yoctocolors", () => {
  return {
    bgBlue: (text: string) => `\u001B[44m${text}\u001B[49m`,
    bgGreen: (text: string) => `\u001B[42m${text}\u001B[49m`,
    bgRed: (text: string) => `\u001B[41m${text}\u001B[49m`,
    bgYellow: (text: string) => `\u001B[43m${text}\u001B[49m`,
    blue: (text: string) => `\u001B[34m${text}\u001B[39m`,
    bold: (text: string) => `\u001B[1m${text}\u001B[22m`,
    cyan: (text: string) => `\u001B[36m${text}\u001B[39m`,
    dim: (text: string) => `\u001B[2m${text}\u001B[22m`,
    green: (text: string) => `\u001B[32m${text}\u001B[39m`,
    inverse: (text: string) => `\u001B[7m${text}\u001B[27m`,
    italic: (text: string) => `\u001B[3m${text}\u001B[23m`,
    magenta: (text: string) => `\u001B[35m${text}\u001B[39m`,
    red: (text: string) => `\u001B[31m${text}\u001B[39m`,
    underline: (text: string) => `\u001B[4m${text}\u001B[24m`,
    yellow: (text: string) => `\u001B[33m${text}\u001B[39m`,
  };
});

describe("Direct Template Formatter", () => {
  let consoleErrorSpy: unknown;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {
      /* empty */
    });
  });

  describe("Basic Functionality", () => {
    it("should leave plain text unchanged", () => {
      const template = "Hello, this is plain text";
      const data = {};

      const result = Formatter.format(template, data);
      expect(result).toBe("Hello, this is plain text");
    });

    it("should replace simple variables", () => {
      const template = "Hello ${name}";
      const data = { name: "John" };

      const result = Formatter.format(template, data);
      expect(result).toBe("Hello John");
    });

    it("should replace multiple variables", () => {
      const template = "Hello ${firstName} ${lastName}";
      const data = { firstName: "John", lastName: "Doe" };

      const result = Formatter.format(template, data);
      expect(result).toBe("Hello John Doe");
    });

    it("should handle undefined variables ", () => {
      const template = "Hello ${name}, you are ${age} years old";
      const data = { name: "John" };

      const result = Formatter.format(template, data);
      expect(result).toBe("Hello ${name}, you are ${age} years old");
    });
  });

  describe("Color Formatting", () => {
    it("should apply single color formatting", () => {
      const template = "This is ${colors.red('red text')}";
      const data = {};

      const result = Formatter.format(template, data);
      expect(result).toBe("This is \u001B[31mred text\u001B[39m");
    });

    it("should apply multiple color formatting", () => {
      const template =
        "${colors.red('Red')} and ${colors.green('green')} and ${colors.blue('blue')}";
      const data = {};

      const result = Formatter.format(template, data);
      expect(result).toBe(
        "\u001B[31mRed\u001B[39m and \u001B[32mgreen\u001B[39m and \u001B[34mblue\u001B[39m",
      );
    });

    it("should apply text style formatting", () => {
      const template =
        "${colors.bold('Bold')}, ${colors.italic('italic')}, and ${colors.underline('underlined')}";
      const data = {};

      const result = Formatter.format(template, data);
      expect(result).toBe(
        "\u001B[1mBold\u001B[22m, \u001B[3mitalic\u001B[23m, and \u001B[4munderlined\u001B[24m",
      );
    });

    it("should apply background colors", () => {
      const template = "${colors.bgRed('Red background')}, ${colors.bgGreen('Green background')}";
      const data = {};

      const result = Formatter.format(template, data);
      expect(result).toBe(
        "\u001B[41mRed background\u001B[49m, \u001B[42mGreen background\u001B[49m",
      );
    });

    it("should apply nested format styling", () => {
      const template = "This is ${colors.bold(colors.red('bold and red'))}";
      const data = {};

      const result = Formatter.format(template, data);
      expect(result).toBe("This is \u001B[1m\u001B[31mbold and red\u001B[39m\u001B[22m");
    });

    it("should apply colors to variables", () => {
      const template = "Welcome, ${colors.green(name)}!";
      const data = { name: "John" };

      const result = Formatter.format(template, data);
      expect(result).toBe("Welcome, \u001B[32mJohn\u001B[39m!");
    });

    it("should apply multiple levels of nested styling", () => {
      const template = "${colors.bold(colors.underline(colors.red('All styles')))}";
      const data = {};

      const result = Formatter.format(template, data);
      expect(result).toBe("\u001B[1m\u001B[4m\u001B[31mAll styles\u001B[39m\u001B[24m\u001B[22m");
    });

    it("should allow combining styled parts", () => {
      const template = "${colors.red('Error')} ${colors.bold('message')}: ${message}";
      const data = { message: "File not found" };

      const result = Formatter.format(template, data);
      expect(result).toBe("\u001B[31mError\u001B[39m \u001B[1mmessage\u001B[22m: File not found");
    });
  });

  describe("JavaScript Expressions", () => {
    it("should evaluate simple expressions", () => {
      const template = "Result: ${2 + 3}";
      const data = {};

      const result = Formatter.format(template, data);
      expect(result).toBe("Result: 5");
    });

    it("should evaluate expressions with variables", () => {
      const template = "Total: ${price * quantity}";
      const data = { price: 10, quantity: 5 };

      const result = Formatter.format(template, data);
      expect(result).toBe("Total: 50");
    });

    it("should evaluate conditional expressions", () => {
      const template = "Status: ${active ? 'Active' : 'Inactive'}";
      const data = { active: true };

      const result = Formatter.format(template, data);
      expect(result).toBe("Status: Active");
    });

    it("should evaluate complex expressions", () => {
      const template = "Result: ${(a + b) * c / d}";
      const data = { a: 10, b: 5, c: 3, d: 2 };

      const result = Formatter.format(template, data);
      expect(result).toBe("Result: 22.5");
    });

    it("should handle string methods", () => {
      const template = "Upper: ${name.toUpperCase()}, Lower: ${name.toLowerCase()}";
      const data = { name: "John" };

      const result = Formatter.format(template, data);
      expect(result).toBe("Upper: JOHN, Lower: john");
    });

    it("should handle array methods", () => {
      const template = "Joined: ${items.join(', ')}";
      const data = { items: ["apple", "banana", "orange"] } as unknown as TemplateData;

      const result = Formatter.format(template, data);
      expect(result).toBe("Joined: apple, banana, orange");
    });

    it("should support object property access", () => {
      const template = "Address: ${user.address.street}, ${user.address.city}";
      const data = {
        user: {
          address: {
            city: "New York",
            street: "123 Main St",
          },
        },
      } as unknown as TemplateData;

      const result = Formatter.format(template, data);
      expect(result).toBe("Address: 123 Main St, New York");
    });
  });

  describe("Combined Features", () => {
    it("should combine conditional expressions with color formatting", () => {
      const template = "Status: ${active ? colors.green('Active') : colors.red('Inactive')}";
      const data = { active: true };

      const result = Formatter.format(template, data);
      expect(result).toBe("Status: \u001B[32mActive\u001B[39m");
    });

    it("should combine variables and color formatting in complex expressions", () => {
      const template =
        "Score: ${score >= 90 ? colors.green(score) : score >= 70 ? colors.yellow(score) : colors.red(score)}/100";
      const data = { score: 85 };

      const result = Formatter.format(template, data);
      expect(result).toBe("Score: \u001B[33m85\u001B[39m/100");
    });

    it("should support formatted arrays using map", () => {
      const template = "Items: ${items.map(item => colors.cyan(item)).join(', ')}";
      const data = { items: ["apple", "banana", "orange"] } as unknown as TemplateData;

      const result = Formatter.format(template, data);
      expect(result).toBe(
        "Items: \u001B[36mapple\u001B[39m, \u001B[36mbanana\u001B[39m, \u001B[36morange\u001B[39m",
      );
    });

    it("should support dynamic color selection", () => {
      const template = "${colors[statusColor](message)}";
      const data = { message: "Critical error", statusColor: "red" };

      const result = Formatter.format(template, data);
      expect(result).toBe("\u001B[31mCritical error\u001B[39m");
    });
  });

  describe("Error Handling", () => {
    it("should handle undefined variables", () => {
      const template = "Hello ${name}";
      const data = {};

      const result = Formatter.format(template, data);
      expect(result).toBe("Hello ${name}");
    });

    it("should handle syntax errors in expressions", () => {
      const template = "Error: ${if(true) {}}";
      const data = {};

      const result = Formatter.format(template, data);
      expect(result).toBe("Error: ${if(true) {}}");
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should handle runtime errors in expressions", () => {
      const template = "Error: ${nonExistentFunction()}";
      const data = {};

      const result = Formatter.format(template, data);
      expect(result).toBe("Error: ${nonExistentFunction()}");
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should handle errors in nested expressions", () => {
      const template = "Error: ${colors.red(undefinedVar + 'text')}";
      const data = {};

      const result = Formatter.format(template, data);
      expect(result).toBe("Error: ${colors.red(undefinedVar + 'text')}");
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty templates", () => {
      const template = "";
      const data = { name: "John" };

      const result = Formatter.format(template, data);
      expect(result).toBe("");
    });

    it("should handle null or undefined data", () => {
      const template = "Hello ${name}";

      // eslint-disable-next-line unicorn/no-null -- Testing edge case
      const result = Formatter.format(template, null as unknown as TemplateData);
      expect(result).toBe("Hello ${name}");
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should handle escaped template literals", () => {
      const template = "This is not a variable: \\${name}";
      const data = { name: "John" };

      const result = Formatter.format(template, data);
      expect(result).toBe("This is not a variable: ${name}");
    });

    it("should handle backticks in the template", () => {
      const template = "Code: `const x = 10;`";
      const data = {};

      const result = Formatter.format(template, data);
      expect(result).toBe("Code: `const x = 10;`");
    });
  });
});
