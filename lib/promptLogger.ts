// Prompt logging utility (frontend stub)
export interface PromptLog {
  prompt: string;
  model: string;
  tokens: number;
  responseId: string;
  version: string;
  timestamp: string;
}

export function logPromptUsage(log: PromptLog) {
  // In production, send to backend or Supabase
  // For now, just log to console
  console.log("[PromptLog]", log);
}
