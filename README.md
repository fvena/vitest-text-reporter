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
[![Build Status](https://github.com/fvena/vitest-text-reporter/workflows/CI%2FCD/badge.svg)]()
[![Status](https://img.shields.io/badge/status-active-success.svg)]()
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
        progress:
          "${colors.green(passedTests)} passed, ${colors.red(failedTests)} failed, ${colors.yellow(pendingTests)} pending (Total tests: ${totalTests})",
        success:
          "${colors.green(`All tests passed in ${duration}s! Files: ${passedFiles}/${totalFiles} passed.`)}",
        failure:
          "${colors.red(`Some tests failed in ${duration}s! Files: ${failedFiles}/${totalFiles} failed.`)}",
      }),
    ],
  },
});
```

## ⚙️ Configuration Options

| Option       | Type     | Description                                                                                                                                                                                                   | Default                                                                                                                                       |
| ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `progress`   | `string` | Template shown during test execution                                                                                                                                                                          | `${colors.green(passedTests)} passed, ${colors.red(failedTests)} failed, ${colors.yellow(pendingTests)} pending (Total tests: ${totalTests})` |
| `success`    | `string` | Template for successful test runs                                                                                                                                                                             | `${colors.green(`All tests passed in ${duration}s! Files: ${passedFiles}/${totalFiles} passed.`)}`                                            |
| `failure`    | `string` | Template for failed test runs                                                                                                                                                                                 | `${colors.red(`Some tests failed in ${duration}s! Files: ${failedFiles}/${totalFiles} failed.`)}`                                             |
| `start`      | `string` | Template shown at start of test run                                                                                                                                                                           | `undefined` (nothing shown)                                                                                                                   |
| `end`        | `string` | Template shown at end of test run                                                                                                                                                                             | `undefined` (nothing shown)                                                                                                                   |
| `clearOnEnd` | `string` | Controls which messages to clear when tests finish. Options:<br>- `'none'`: Keep all messages<br>- `'progress'`: Clear only progress messages<br>- `'progress-start'`: Clear both progress and start messages | `'progress'`                                                                                                                                  |

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

- `duration`: Time elapsed since test run started (seconds)
- `startTime`: Timestamp when test run started
- `endTime`: Timestamp when test run completed (only in `end` template)
- `timestamp`: Current timestamp

## 🧪 Formatting

Templates use JavaScript template literals with access to a `colors` object that provides terminal styling:

```ts
// For colored text:
"${colors.red(`Error: ${errorMessage}`)}";

// For bold text:
"${colors.bold(`Important message: ${message}`)}";

// For background colors:
"${colors.bgYellow(`Warning: ${warningMessage}`)}";

// For combining styles (nested):
"${colors.bold(colors.red(`Critical Error: ${errorMessage}`))}";

// Multiple lines:
"${colors.green(passedTests)}\n${colors.red(failedTests)}\n${colors.yellow(pendingTests)}";
```

Available colors and styles from [yoctocolors](https://github.com/sindresorhus/yoctocolors):

- Basic colors: `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `gray`
- Text styles: `bold`, `dim`, `italic`, `underline`, `strikethrough`, `hidden`
- Background colors: `bgBlack`, `bgRed`, `bgGreen`, `bgYellow`, `bgBlue`, `bgMagenta`, `bgCyan`, `bgWhite`

## 🧪 Examples

### Minimal Progress Report

```ts
new TextReporter({
  progress:
    "${colors.green(passedTests)} ✓ | ${colors.red(failedTests)} ✗ | ${colors.yellow(pendingTests)} ?",
});
```

### Detailed Success Report

```ts
new TextReporter({
  success: [
    "✅ ${colors.bold(colors.green(`${passedTests}/${totalTests}`))} tests passed in ${colors.blue(duration)}s",
    "Files: ${colors.green(`${passedFiles}/${totalFiles}`)}",
    "Started: ${colors.blue(startTime)}",
  ].join("\n"),
});
```

### Custom Start and End Messages

```ts
new TextReporter({
  start: "Running test suite at ${colors.blue(timestamp)}...",
  end: "Test suite ${colors.red(failedTests > 0 ? 'failed' : 'completed')} at ${timestamp} (${colors.bold(duration)}s)",
});
```

### Custom Message Clearing Behavior

```ts
new TextReporter({
  start: "Running test suite at ${colors.blue(timestamp)}...",
  progress:
    "${colors.green(passedTests)} ✓ | ${colors.red(failedTests)} ✗ | ${colors.yellow(pendingTests)} ?",
  clearOnEnd: "none", // Keep all messages visible after tests finish
});

// Or to clear everything at the end:
new TextReporter({
  start: "Running test suite at ${colors.blue(timestamp)}...",
  progress:
    "${colors.green(passedTests)} ✓ | ${colors.red(failedTests)} ✗ | ${colors.yellow(pendingTests)} ?",
  clearOnEnd: "progress-start", // Clear both progress and start messages when tests finish
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
