import type { Reporter, TestCase, TestModule } from "vitest/node";

type TestState = "fail" | "pass" | "pending";

interface TestInfo {
  fileId: string; // ID del archivo al que pertenece
  state: TestState;
}

interface FileStats {
  failed: number;
  name: string; // Nombre del archivo para visualización
  passed: number;
  pending: number;
}

interface ReporterOptions {
  colors?: boolean;
  end?: string;
  failure?: string;
  progress?: string;
  start?: string;
  success?: string;
}

export default class CustomReporter implements Reporter {
  // Estructura principal: tests con referencia a su archivo
  private tests = new Map<string, TestInfo>();

  // Estructura secundaria: contadores por archivo
  private files = new Map<string, FileStats>();

  private progressTemplate: string;
  private successTemplate: string;
  private failureTemplate: string;
  private startTemplate: string | undefined;
  private endTemplate: string | undefined;
  private startTime = 0;
  private useColors: boolean;

  constructor(options?: ReporterOptions) {
    // Plantillas por defecto, en caso de no proporcionar alguna en las opciones
    this.progressTemplate =
      options?.progress ??
      "{passedTests} passed, {failedTests} failed, {pendingTests} pending (Total tests: {totalTests})";
    this.successTemplate =
      options?.success ??
      "All tests passed in {totalTime}s! Files: {passedFiles}/{totalFiles} passed.";
    this.failureTemplate =
      options?.failure ??
      "Some tests failed in {totalTime}s! Files: {failedFiles}/{totalFiles} failed.";
    this.startTemplate = options?.start ?? undefined;
    this.endTemplate = options?.end ?? undefined;
    this.useColors = options?.colors ?? process.stdout.isTTY;
  }

  onInit(): void {
    this.startTime = Date.now();

    // Si hay una plantilla de inicio, la mostramos
    if (this.startTemplate) {
      const fileStats = { failedFiles: 0, passedFiles: 0, pendingFiles: 0, totalFiles: 0 };
      const testStats = { failedTests: 0, passedTests: 0, pendingTests: 0, totalTests: 0 };

      // En este punto aún no tenemos datos de test, pero podemos proporcionar el timestamp
      const data = {
        ...testStats,
        ...fileStats,
        startTime: new Date().toISOString(),
        timestamp: Date.now(),
      };

      const message = this.formatTemplate(this.startTemplate, data);
      if (this.useColors) {
        console.log(`\u001B[90m${message}\u001B[0m`);
      } else {
        console.log(message);
      }
    } else {
      // Mensaje por defecto si no hay plantilla
      this.log("Running tests...");
    }
  }

  onTestModuleCollected(module: TestModule): void {
    const fileId = module.id;
    const fileName = module.moduleId.split("/").pop() ?? fileId;

    // Inicializamos las estadísticas del archivo
    this.files.set(fileId, {
      failed: 0,
      name: fileName,
      passed: 0,
      pending: 0,
    });

    // Registramos todos los tests de este módulo
    for (const test of module.children.allTests()) {
      this.tests.set(test.id, {
        fileId,
        state: "pending",
      });

      // Incrementamos el contador de pendientes para este archivo
      const fileStats = this.files.get(fileId);
      if (!fileStats) return;
      fileStats.pending++;
    }
  }

  onTestCaseResult = (testCase: TestCase): void => {
    const result = testCase.result();
    if (this.tests.has(testCase.id)) {
      const testInfo = this.tests.get(testCase.id);
      if (!testInfo) return;
      const oldState = testInfo.state;
      let newState: TestState = oldState;

      if (result.state === "passed") {
        newState = "pass";
      } else if (result.state === "failed") {
        newState = "fail";
      }

      // Solo actualizamos si el estado cambió
      if (newState !== oldState) {
        this.updateTestState(testCase.id, testInfo, newState);
      }
    }

    this.updateProgress();
  };

  /**
   * Actualiza el estado de un test y los contadores del archivo
   */
  private updateTestState(testId: string, testInfo: TestInfo, newState: TestState): void {
    const fileStats = this.files.get(testInfo.fileId);
    if (!fileStats) return;
    const oldState = testInfo.state;

    // Actualizamos los contadores del archivo
    switch (oldState) {
      case "fail": {
        {
          fileStats.failed--;
          // No default
        }
        break;
      }
      case "pass": {
        fileStats.passed--;
        break;
      }
      case "pending": {
        fileStats.pending--;
        break;
      }
    }

    // Incrementamos el contador del nuevo estado
    switch (newState) {
      case "fail": {
        {
          fileStats.failed++;
          // No default
        }
        break;
      }
      case "pass": {
        fileStats.passed++;
        break;
      }
      case "pending": {
        fileStats.pending++;
        break;
      }
    }

    // Actualizamos el estado del test
    testInfo.state = newState;
  }

  onTestRunEnd(): void {
    const totalTime = (Date.now() - this.startTime) / 1000;
    this.displaySummary(totalTime);

    // Si hay una plantilla de fin, la mostramos
    if (this.endTemplate) {
      const testStats = this.getTestStats();
      const fileStats = this.computeFileStats();

      const data = {
        ...testStats,
        ...fileStats,
        endTime: new Date().toISOString(),
        timestamp: Date.now(),
        totalTime: totalTime.toFixed(1),
      };

      const message = this.formatTemplate(this.endTemplate, data);
      if (this.useColors) {
        console.log(`\u001B[90m${message}\u001B[0m`);
      } else {
        console.log(message);
      }
    }
  }

  /**
   * Calcula las estadísticas de archivos usando los contadores precomputados
   */
  private computeFileStats(): {
    failedFiles: number;
    passedFiles: number;
    pendingFiles: number;
    totalFiles: number;
  } {
    let passedFiles = 0;
    let failedFiles = 0;
    let pendingFiles = 0;

    for (const stats of this.files.values()) {
      if (stats.failed > 0) {
        failedFiles++;
      } else if (stats.pending > 0) {
        pendingFiles++;
      } else {
        passedFiles++;
      }
    }

    return {
      failedFiles,
      passedFiles,
      pendingFiles,
      totalFiles: this.files.size,
    };
  }

  /**
   * Colores disponibles para formateo
   */
  private readonly colors = {
    black: "\u001B[30m",
    blue: "\u001B[34m",
    cyan: "\u001B[36m",
    gray: "\u001B[90m",
    green: "\u001B[32m",
    magenta: "\u001B[35m",
    red: "\u001B[31m",
    reset: "\u001B[0m",
    white: "\u001B[37m",
    yellow: "\u001B[33m",
  };

  /**
   * Función que reemplaza variables en la plantilla con soporte para colores.
   *
   * Soporta:
   * - Variables simples: \{variable\}
   * - Variables con color: \{variable:color\}
   *
   * Ejemplo: "Tests: \{passedTests:green\} passed, \{failedTests:red\} failed"
   */
  private formatTemplate(template: string, data: Record<string, number | string>): string {
    return template.replaceAll(/\{(\w+)(?::(\w+))?\}/g, (match, key: string, color?: string) => {
      // Si la clave no existe en los datos, devolvemos el texto original
      if (!(key in data)) {
        return match;
      }

      const value = String(data[key]);

      // Si no hay color especificado o los colores están desactivados, devolvemos el valor tal cual
      if (!color || !this.useColors) {
        return value;
      }

      // Si el color especificado existe, lo aplicamos
      if (this.colors[color as keyof typeof this.colors]) {
        return `${this.colors[color as keyof typeof this.colors]}${value}${this.colors.reset}`;
      }

      // Si el color no se reconoce, devolvemos el valor sin colorear
      return value;
    });
  }

  /**
   * Obtiene las estadísticas totales de los tests
   */
  private getTestStats(): {
    failedTests: number;
    passedTests: number;
    pendingTests: number;
    totalTests: number;
  } {
    let passedTests = 0;
    let failedTests = 0;
    let pendingTests = 0;

    // Sumamos los contadores de todos los archivos
    for (const fileStats of this.files.values()) {
      passedTests += fileStats.passed;
      failedTests += fileStats.failed;
      pendingTests += fileStats.pending;
    }

    return {
      failedTests,
      passedTests,
      pendingTests,
      totalTests: this.tests.size,
    };
  }

  /**
   * Actualiza el mensaje de progreso durante la ejecución de los tests.
   */
  private updateProgress(): void {
    const elapsedTime = (Date.now() - this.startTime) / 1000;
    const testStats = this.getTestStats();
    const fileStats = this.computeFileStats();

    const data = {
      ...testStats,
      elapsedTime: elapsedTime.toFixed(1),
      totalTime: "-", // No definido aún en progreso
      ...fileStats,
    };

    const message = this.formatTemplate(this.progressTemplate, data);
    this.clearLine();
    process.stdout.write(message);
  }

  /**
   * Muestra el resumen final de la ejecución
   */
  private displaySummary(totalTime: number): void {
    const testStats = this.getTestStats();
    const fileStats = this.computeFileStats();

    const data = {
      ...testStats,
      elapsedTime: totalTime.toFixed(1),
      totalTime: totalTime.toFixed(1),
      ...fileStats,
    };

    this.clearLine();

    const template = testStats.failedTests > 0 ? this.failureTemplate : this.successTemplate;
    const message = this.formatTemplate(template, data);

    // Ya no necesitamos colorear manualmente el mensaje completo porque
    // los colores ya se aplicaron en formatTemplate para cada variable que lo necesite
    process.stdout.write(`${message}\n`);

    // Opcionalmente podríamos agregar un detalle de archivos fallidos
    if (testStats.failedTests > 0 && this.useColors) {
      this.displayFailedFiles();
    }
  }

  /**
   * Muestra el detalle de archivos fallidos
   */
  private displayFailedFiles(): void {
    process.stdout.write("\u001B[90mFailed files:\u001B[0m\n");

    for (const [, stats] of this.files.entries()) {
      if (stats.failed > 0) {
        process.stdout.write(
          `\u001B[31m- ${stats.name}: ${String(stats.failed)} failed, ${String(stats.passed)} passed\u001B[0m\n`,
        );
      }
    }
  }

  /**
   * Remueve todas las secuencias de color ANSI de un string
   */
  private stripColors(text: string): string {
    const ansiPattern = String.fromCodePoint(27) + "[" + String.raw`\d+m`;
    return text.replaceAll(new RegExp(ansiPattern, "g"), "");
  }

  /**
   * Limpia la línea actual en la consola
   */
  private clearLine(): void {
    process.stdout.write("\r\u001B[K");
  }

  /**
   * Log simple para mensajes informativos
   */
  private log(message: string): void {
    if (this.useColors) {
      console.log(`\u001B[90m${message}\u001B[0m`);
    } else {
      console.log(message);
    }
  }
}
