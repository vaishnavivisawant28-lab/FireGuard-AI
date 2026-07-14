/** Gemini API client helpers — all calls go through the API server */

export interface IncidentAnalysis {
  incidentSummary: string;
  severityAnalysis: string;
  possibleCause: string;
  immediateActions: string[];
  evacuationGuidance: string[];
  safetyRecommendations: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface DailySummary {
  overallRating: "SAFE" | "CAUTION" | "CRITICAL";
  summary: string;
  highestRiskArea: string;
  commonCauses: string[];
  aiRecommendations: string[];
  statusBadge: string;
}

export interface ZonePayload {
  id: number;
  name: string;
  smoke: number;
  temperature: number;
  humans: number;
  pets: number;
}

export interface LocationPayload {
  facility: string;
  address: string;
  coords: string;
}

export interface EventPayload {
  time: string;
  message: string;
  level: string;
}

const BASE = "/api/ai";

async function callApi<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({ success: false, error: `HTTP ${res.status} ${res.statusText}` }));
  if (!data.success) {
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  return data as T;
}

export async function analyzeIncident(payload: {
  zones: ZonePayload[];
  location: LocationPayload;
  events: EventPayload[];
  overall: string;
  power: string;
}): Promise<{ analysis: IncidentAnalysis; generatedAt: string }> {
  return callApi(`${BASE}/analyze-incident`, payload);
}

export async function chatWithAI(
  message: string,
  context: {
    zones: ZonePayload[];
    location: LocationPayload;
    events: EventPayload[];
    overall: string;
    power: string;
  }
): Promise<string> {
  const data = await callApi<{ reply: string }>(`${BASE}/chat`, { message, context });
  return data.reply;
}

export async function getDailySummary(payload: {
  events: EventPayload[];
  zones: ZonePayload[];
  location: LocationPayload;
}): Promise<{ summary: DailySummary; generatedAt: string }> {
  return callApi(`${BASE}/daily-summary`, payload);
}
