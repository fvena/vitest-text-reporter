export type TestState = "fail" | "pass" | "pending";

export interface TestInfo {
  fileId: string;
  state: TestState;
}

export interface FileStats {
  failedTests: number;
  name: string;
  passedTests: number;
  pendingTests: number;
}

export interface Templates {
  end?: string;
  failure: string;
  progress: string;
  start?: string;
  success: string;
}

export type TextReporterOptions = Partial<Templates>;

export interface TestStats {
  failedFiles: number;
  failedTests: number;
  passedFiles: number;
  passedTests: number;
  pendingFiles: number;
  pendingTests: number;
  totalFiles: number;
  totalTests: number;
}

export interface TimeData {
  duration: number;
  endTime?: number;
  startTime: number;
  timestamp: number;
}

export type TemplateData = Record<string, number | string> & TestStats & TimeData;
