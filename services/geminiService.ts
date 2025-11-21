import { PresenceEvent, Session, Store } from "../types";

// Mock AI service to function without API Key for offline/APK builds
export const generateStaffingInsight = async (
  sessions: Session[],
  events: PresenceEvent[],
  stores: Store[]
): Promise<string> => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const activeSessions = sessions.filter(s => !s.exitTime).length;
  const busyStores = stores.filter(store => 
      sessions.some(s => s.storeId === store.id && !s.exitTime)
  ).length;

  const insights = [
      `Staffing distribution is currently balanced across ${busyStores} active zones.`,
      "Consider increasing staff availability during the upcoming lunch peak (12PM - 2PM).",
      "Signal quality in 'Mall Boutique' is optimal, but check 'Airport Kiosk' for potential interference.",
      "Dwell times are trending 15% higher than yesterday, indicating longer shifts.",
      "Employee coverage is optimal for the current number of open locations."
  ];

  // Pick random tips to simulate dynamic insight
  const randomTip = insights[Math.floor(Math.random() * insights.length)];

  return `AI Analysis (Offline Mode):
  • Current Staffing: ${activeSessions} active employees.
  • Efficiency Rating: ${activeSessions > 1 ? 'High' : 'Standard'}.
  • Insight: ${randomTip}`;
};