/**
 * Definições de tipos TypeScript para a aplicação.
 */

export interface ClassificationResult {
  categoria: string;
  confianca: number;
  razao?: string;
  resposta_sugerida: string;
  email_original?: string;
}

export interface ApiError {
  error: string;
}

export interface HealthStatus {
  status: string;
  gemini_api: string;
  message: string;
}
