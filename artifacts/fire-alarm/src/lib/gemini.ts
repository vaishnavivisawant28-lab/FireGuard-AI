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

export async function analyzeIncident(payload: {
  zones: ZonePayload[];
  location: LocationPayload;
  events: EventPayload[];
  overall: string;
  power: string;
}): Promise<{ analysis: IncidentAnalysis; generatedAt: string }> {
  const res = await fetch(`${BASE}/analyze-incident`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Incident analysis request failed");
  const data = await res.json();
  if (!data.success) throw new Error(data.error ?? "Unknown error");
  return data;
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
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, context }),
  });
  if (!res.ok) throw new Error("Chat request failed");
  const data = await res.json();
  if (!data.success) throw new Error(data.error ?? "Unknown error");
  return data.reply as string;
}

export async function getDailySummary(payload: {
  events: EventPayload[];
  zones: ZonePayload[];
  location: LocationPayload;
}): Promise<{ summary: DailySummary; generatedAt: string }> {
  const res = await fetch(`${BASE}/daily-summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Daily summary request failed");
  const data = await res.json();
  if (!data.success) throw new Error(data.error ?? "Unknown error");
  return data;
}
