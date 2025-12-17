export interface TableData {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface SavedFile {
  id: string;
  name: string;
  data: TableData;
  lastModified: number;
}

export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'radar';

export interface AnalysisResult {
  summary: string;
  trends: string[];
  suggestion: string;
}

export interface GenerationResponse {
  headers: string[];
  rows: string[][];
}