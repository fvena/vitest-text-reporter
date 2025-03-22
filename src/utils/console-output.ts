/**
 * Clears the current line in the console
 */
function clearLine(rows = 1): void {
  for (let index = 0; index < rows; index++) {
    // Move cursor up one line except for the first iteration
    if (index > 0) {
      process.stdout.write("\u001B[1A");
    }
    // Clear the current line
    process.stdout.write("\r\u001B[K");
  }
}

/**
 * Logs a message with optional gray color
 */
function print(message: string): void {
  process.stdout.write(message);
}

export default { clearLine, print };
