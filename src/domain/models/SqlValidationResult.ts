export interface SqlValidationResult {
  correct: boolean;
  message: string;
  hints?: string[];
}
