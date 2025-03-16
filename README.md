<br /><!-- markdownlint-disable-line -->

<p align="right">
  <a href="https://github.com/fvena/vitest-text-reporter">
    ⭐ &nbsp;&nbsp;<strong>Star this template if you find it useful</strong> ↗️
  </a>
</p>

<p align="center">
  ![Screenshot of reporter in action](https://via.placeholder.com/800x200?text=Reporter+Screenshot)

  <img src="https://raw.githubusercontent.com/fvena/vitest-text-reporter/main/docs/public/logo.png" alt="TypeScript Library Template Pro Logo" width="180"/>

  <h1 align="center">Vitest Text Reporter</h1>
  <div align="center">A minimal, efficient, and highly customizable text reporter for [Vitest](https://vitest.dev) that provides beautiful, color-coded output with detailed statistics about your test runs.</div>
</p>

<br/>

<div align="center">

<!-- markdownlint-disable MD042 -->

![GitHub package.json version](https://img.shields.io/github/package-json/v/fvena/vitest-text-reporter)
[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Build Status](https://github.com/fvena/vitest-text-reporter/workflows/CI%2FCD/badge.svg)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

<!-- markdownlint-enable MD042 -->

</div>

## 🚀 Features

- 🔍 **Minimalistic**: Clean, distraction-free output focused on what matters
- 🎨 **Color Support**: Beautiful color-coded output for better readability
- 📝 **Customizable Templates**: Define exactly how your test results should look
- ⚡ **Optimized Performance**: Efficient tracking even for projects with thousands of tests
- 📊 **Detailed Statistics**: Track tests and files separately with comprehensive stats
- 🔄 **Real-time Updates**: Live progress updates during test execution

## 📦 Installation

```bash
# npm
npm install vitest-text-reporter -D

# yarn
yarn add vitest-text-reporter -D

# pnpm
pnpm add vitest-text-reporter -D
```

## 🔧 Usage

Add the reporter to your Vitest configuration:

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import TextReporter from "vitest-text-reporter";

export default defineConfig({
  test: {
    reporters: [
      new TextReporter({
        // Optional configuration
        progress: "{passedTests:green} ✓ passed, {failedTests:red} ✗ failed",
        success: "{passedTests:green} tests passed in {elapsedTime:cyan}s",
        // See more options below
      }),
    ],
  },
});
```

## ⚙️ Configuration Options

| Option     | Type     | Description                          | Default                                                                                          |
| ---------- | -------- | ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `progress` | `string` | Template shown during test execution | `{passedTests} passed, {failedTests} failed, {pendingTests} pending (Total tests: {totalTests})` |
| `success`  | `string` | Template for successful test runs    | `All tests passed in {totalTime}s! Files: {passedFiles}/{totalFiles} passed.`                    |
| `failure`  | `string` | Template for failed test runs        | `Some tests failed in {totalTime}s! Files: {failedFiles}/{totalFiles} failed.`                   |
| `start`    | `string` | Template shown at start of test run  | `undefined` (nothing shown)                                                                      |
| `end`      | `string` | Template shown at end of test run    | `undefined` (nothing shown)                                                                      |

## 📋 Template Variables

You can use the following variables in your templates:

### Test Statistics

- `totalTests`: Total number of tests
- `passedTests`: Number of passed tests
- `failedTests`: Number of failed tests
- `pendingTests`: Number of pending tests

### File Statistics

- `totalFiles`: Total number of test files
- `passedFiles`: Number of files with all tests passing
- `failedFiles`: Number of files with at least one test failing
- `pendingFiles`: Number of files with pending tests

### Time Information

- `elapsedTime`: Time elapsed since test run started (seconds)
- `startTime`: Timestamp when test run started
- `endTime`: Timestamp when test run completed (only in `end` template)
- `timestamp`: Current timestamp
- `totalTime`: Total time taken for the test run in seconds (only available when tests are completed)

## 🎨 Color Formatting

Add colors to your variables using the syntax `{variable:color}`. Available colors and styles from [yoctocolors](https://github.com/sindresorhus/yoctocolors):

- Basic colors: `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `gray`
- Text styles: `bold`, `dim`, `italic`, `underline`, `strikethrough`, `hidden`
- Background colors: `bgBlack`, `bgRed`, `bgGreen`, `bgYellow`, `bgBlue`, `bgMagenta`, `bgCyan`, `bgWhite`

Combine multiple styles with dot notation: `{elapsedTime:bold.green}`, `{failedTests:underline.red}`

## 🧪 Examples

### Minimal Progress Report

```ts
new TextReporter({
  progress: "{passedTests:green} ✓ | {failedTests:red} ✗ | {pendingTests:yellow} ?",
});
```

### Detailed Success Report

```ts
new TextReporter({
  success: [
    "✅ {passedTests:bold.green}/{totalTests} tests passed in {elapsedTime:blue}s",
    "Files: {passedFiles:green}/{totalFiles}",
    "Started: {startTime}",
  ].join("\n"),
});
```

### Custom Start and End Messages

```ts
new TextReporter({
  start: "Running test suite at {timestamp:blue}...",
  end: "Test suite {failedTests:red|completed:green} at {timestamp} ({elapsedTime:bold}s)",
});
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Acknowledgements

- [Vitest](https://vitest.dev) - The blazing fast unit testing framework
- [yoctocolors](https://github.com/sindresorhus/yoctocolors) - Terminal colors for humans

---

<p align="center">
  Your ⭐ motivates continued development and maintenance
</p>
