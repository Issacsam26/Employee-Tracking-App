import { GoogleGenAI } from "@google/genai";
import { PresenceEvent, Session, Store } from "../types";

// Initialize the client
// Note: In a real production app, this should be proxied through a backend to protect the key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateStaffingInsight = async (
  sessions: Session[],
  events: PresenceEvent[],
  stores: Store[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please configure process.env.API_KEY to use AI insights.";
  }

  try {
    // Prepare a summary for the model
    const activeSessions = sessions.filter(s => !s.exitTime).length;
    const recentExits = sessions.filter(s => s.exitTime).length;
    
    const summaryData = {
      totalActiveSessions: activeSessions,
      completedSessionsToday: recentExits,
      storeCount: stores.length,
      sampleRecentEvents: events.slice(0, 10).map(e => ({
        type: e.eventType,
        rssi: e.rssi,
        store: stores.find(s => s.id === e.storeId)?.name
      }))
    };

    const prompt = `
      Analyze the following Wi-Fi presence detection data for a retail chain.
      Data: ${JSON.stringify(summaryData, null, 2)}
      
      Please provide a concise 3-bullet point summary covering:
      1. Current staffing efficiency.
      2. Potential signal quality issues (based on RSSI samples).
      3. Anomalies in entry/exit patterns.
      
      Keep the tone professional and analytical.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No insight generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate insights at this time. Please try again later.";
  }
};