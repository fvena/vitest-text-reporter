export type TestState = "fail" | "pass" | "pending";

export interface TestInfo {
  fileId: string;
  state: TestState;
}

export interface FileStats {
  failed: number;
  name: string;
  passed: number;
  pending: number;
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
  failedTests: number;
  passedTests: number;
  pendingTests: number;
  totalTests: number;
}

export interface FileStatsResult {
  failedFiles: number;
  passedFiles: number;
  pendingFiles: number;
  totalFiles: number;
}

export interface TimeData {
  elapsedTime: number;
  endTime?: number;
  startTime: number;
  timestamp: number;
}

export type TemplateData = FileStatsResult & Record<string, number | string> & TestStats & TimeData;
