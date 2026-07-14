import { Router, type IRouter } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router: IRouter = Router();

const MODEL = "gemini-2.0-flash-lite"; // separate quota from gemini-2.0-flash

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set.");
  return new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: MODEL });
}

function extractUserFacingError(err: unknown): string {
  if (!(err instanceof Error)) return "Unknown error occurred.";
  const msg = err.message;
  if (msg.includes("429") || msg.includes("Too Many Requests") || msg.includes("quota")) {
    return `Gemini API quota exceeded (free tier limit reached). Please wait a minute and try again, or enable billing at https://aistudio.google.com. Raw: ${msg.slice(0, 200)}`;
  }
  if (msg.includes("401") || msg.includes("403") || msg.includes("API_KEY") || msg.includes("invalid")) {
    return `Gemini API key rejected (401/403). Verify your GEMINI_API_KEY at https://aistudio.google.com/app/apikey. Raw: ${msg.slice(0, 200)}`;
  }
  return msg;
}

/**
 * POST /api/ai/analyze-incident
 */
router.post("/analyze-incident", async (req, res) => {
  try {
    const { zones, location, events, overall, power } = req.body as {
      zones: Array<{ id: number; name: string; smoke: number; temperature: number; humans: number; pets: number }>;
      location: { facility: string; address: string; coords: string };
      events: Array<{ time: string; message: string; level: string }>;
      overall: string;
      power: string;
    };

    const model = getModel();

    const affectedZones = zones.filter(z => z.smoke > 40 || z.temperature > 40);
    const zoneDetails = affectedZones.map(z =>
      `${z.name}: smoke=${z.smoke}%, temp=${z.temperature}°C, humans=${z.humans}, pets=${z.pets}`
    ).join("\n");

    const recentLogs = events.slice(0, 8).map(e => `[${e.level}] ${e.message}`).join("\n");

    const prompt = `You are FireGuard AI, an expert fire safety and emergency response system. Analyze this real-time fire incident data and provide a structured JSON response.

INCIDENT DATA:
- Facility: ${location.facility}
- Address: ${location.address}
- Coordinates: ${location.coords}
- Overall Status: ${overall}
- Power Status: ${power}
- Timestamp: ${new Date().toISOString()}

AFFECTED ZONES:
${zoneDetails || "No zones currently in alert"}

RECENT SYSTEM LOG:
${recentLogs || "No recent events"}

Respond ONLY with valid JSON in this exact structure:
{
  "incidentSummary": "2-3 sentence factual summary of the incident",
  "severityAnalysis": "Assessment of severity level and why (1-2 sentences)",
  "possibleCause": "Most likely cause(s) based on smoke/heat readings (1-2 sentences)",
  "immediateActions": ["action 1", "action 2", "action 3", "action 4"],
  "evacuationGuidance": ["step 1", "step 2", "step 3", "step 4"],
  "safetyRecommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "riskLevel": "LOW"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Gemini returned no JSON. Raw response: " + text.slice(0, 300));

    const parsed = JSON.parse(jsonMatch[0]);
    res.json({ success: true, analysis: parsed, generatedAt: new Date().toISOString() });
  } catch (err) {
    req.log.error({ err }, "Gemini incident analysis failed");
    res.status(500).json({ success: false, error: extractUserFacingError(err) });
  }
});

/**
 * POST /api/ai/chat
 */
router.post("/chat", async (req, res) => {
  try {
    const { message, context } = req.body as {
      message: string;
      context: {
        zones: Array<{ id: number; name: string; smoke: number; temperature: number; humans: number; pets: number }>;
        location: { facility: string; address: string; coords: string };
        events: Array<{ time: string; message: string; level: string }>;
        overall: string;
        power: string;
      };
    };

    const model = getModel();

    const zoneStatus = context.zones.map(z =>
      `${z.name}: smoke=${z.smoke}%, temp=${z.temperature}°C, occupants=${z.humans + z.pets}`
    ).join("; ");

    const recentEvents = context.events.slice(0, 6).map(e => `[${e.level}] ${e.message}`).join("\n");

    const systemContext = `You are FireGuard AI, a professional fire safety and emergency response assistant embedded in a real-time fire monitoring system.

Current system state:
- Facility: ${context.location.facility}
- Address: ${context.location.address}
- Overall Status: ${context.overall}
- Power: ${context.power}
- Zones: ${zoneStatus}
- Recent events:
${recentEvents}

Today's date: ${new Date().toLocaleDateString()}

You provide clear, concise, professional advice on fire safety, emergency response, and current incident status. Keep responses under 150 words. Use bullet points for lists. Never make up data not provided above.`;

    const result = await model.generateContent(`${systemContext}\n\nUser question: ${message}`);
    const reply = result.response.text().trim();

    res.json({ success: true, reply, timestamp: new Date().toISOString() });
  } catch (err) {
    req.log.error({ err }, "Gemini chat failed");
    res.status(500).json({ success: false, error: extractUserFacingError(err) });
  }
});

/**
 * POST /api/ai/daily-summary
 */
router.post("/daily-summary", async (req, res) => {
  try {
    const { events, zones, location } = req.body as {
      events: Array<{ time: string; message: string; level: string }>;
      zones: Array<{ id: number; name: string; smoke: number; temperature: number; humans: number; pets: number }>;
      location: { facility: string; address: string; coords: string };
    };

    const model = getModel();

    const alertCount = events.filter(e => e.level === "FIRE ALERT").length;
    const warningCount = events.filter(e => e.level === "WARNING").length;
    const allLogs = events.map(e => `[${e.level}] ${e.message}`).join("\n");
    const highestSmokeZone = zones.reduce((max, z) => z.smoke > max.smoke ? z : max, zones[0]);

    const prompt = `You are FireGuard AI. Generate a daily safety summary based on this data.

Facility: ${location.facility}
Date: ${new Date().toLocaleDateString()}
Total Alerts Today: ${alertCount} fire alerts, ${warningCount} warnings
Highest Risk Zone: ${highestSmokeZone.name} (smoke: ${highestSmokeZone.smoke}%, temp: ${highestSmokeZone.temperature}°C)
Event Log:
${allLogs || "No events recorded today"}

Respond ONLY with valid JSON:
{
  "overallRating": "SAFE",
  "summary": "2-sentence overview of today's safety status",
  "highestRiskArea": "zone name and why",
  "commonCauses": ["cause 1", "cause 2"],
  "aiRecommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "statusBadge": "one short phrase like All Clear or Elevated Risk"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Gemini returned no JSON. Raw response: " + text.slice(0, 300));

    const parsed = JSON.parse(jsonMatch[0]);
    res.json({ success: true, summary: parsed, generatedAt: new Date().toISOString() });
  } catch (err) {
    req.log.error({ err }, "Gemini daily summary failed");
    res.status(500).json({ success: false, error: extractUserFacingError(err) });
  }
});

export default router;
