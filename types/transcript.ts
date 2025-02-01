export interface TranscriptResult {
  text: string;
  confidence: number;
  is_final: boolean;
  word_timings?: Array<[string, number, number]>;
  detected_terms: string[];
  language?: string;
}