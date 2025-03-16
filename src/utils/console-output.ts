/**
 * Clears the current line in the console
 */
function clearLine(): void {
  process.stdout.write("\r\u001B[K");
}

/**
 * Logs a message with optional gray color
 */
function print(message: string): void {
  process.stdout.write(message);
}

export default { clearLine, print };
