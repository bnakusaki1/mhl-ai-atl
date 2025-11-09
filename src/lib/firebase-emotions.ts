import { ref, push, set, get, query, orderByChild } from 'firebase/database';
import { db } from './firebase'; // Your Firebase client setup

export interface EmotionDataPoint {
  timestamp: number;        // seconds into video
  emotion: string;          // fear, excitement, etc.
  arousal: number;
  valence: number;
  bpm: number;
  sceneDescription: string;
  reasoning: string;
  confidence: number;
  capturedAt: number;       // Unix timestamp
}

export interface WatchSession {
  id?: string;
  userId: string;
  videoId: string;
  videoTitle: string;
  startTime: number;        // Unix timestamp
  endTime?: number;
  duration: number;         // seconds
  emotions: EmotionDataPoint[];
  averageBPM: number;
  dominantEmotion: string;
  emotionSummary: {
    fear: number;
    excitement: number;
    sadness: number;
    joy: number;
    calm: number;
    // etc.
  };
}

// Save emotion data point during watching
export async function saveEmotionDataPoint(
  sessionId: string,
  emotion: EmotionDataPoint
): Promise<void> {
  const emotionRef = ref(db, `sessions/${sessionId}/emotions`);
  await push(emotionRef, emotion);
}

// Create new watch session
export async function createWatchSession(
  userId: string,
  videoId: string,
  videoTitle: string
): Promise<string> {
  const sessionsRef = ref(db, `sessions`);
  const newSessionRef = push(sessionsRef);
  
  const session: Partial<WatchSession> = {
    userId,
    videoId,
    videoTitle,
    startTime: Date.now(),
    emotions: [],
    averageBPM: 0,
    dominantEmotion: 'calm'
  };
  
  await set(newSessionRef, session);
  return newSessionRef.key!;
}

// End session and calculate summary
export async function endWatchSession(
  sessionId: string,
  emotions: EmotionDataPoint[]
): Promise<void> {
  // Calculate statistics
  const avgBPM = emotions.reduce((sum, e) => sum + e.bpm, 0) / emotions.length;
  
  // Count emotions
  const emotionCounts: Record<string, number> = {};
  emotions.forEach(e => {
    emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
  });
  
  // Find dominant emotion
  const dominantEmotion = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)[0][0];
  
  // Calculate percentages
  const total = emotions.length;
  const emotionSummary = Object.fromEntries(
    Object.entries(emotionCounts).map(([emotion, count]) => [
      emotion,
      Math.round((count / total) * 100)
    ])
  );
  
  // Update session
  const sessionRef = ref(db, `sessions/${sessionId}`);
  await set(sessionRef, {
    endTime: Date.now(),
    averageBPM: Math.round(avgBPM),
    dominantEmotion,
    emotionSummary,
    duration: emotions[emotions.length - 1]?.timestamp || 0
  });
}

// Get user's watch history
export async function getUserWatchHistory(
  userId: string
): Promise<WatchSession[]> {
  const sessionsRef = ref(db, `sessions`);
  const userSessionsQuery = query(
    sessionsRef,
    orderByChild('userId')
  );
  
  const snapshot = await get(userSessionsQuery);
  
  if (!snapshot.exists()) return [];
  
  const sessions: WatchSession[] = [];
  snapshot.forEach((child) => {
    const data = child.val();
    if (data.userId === userId) {
      sessions.push({
        id: child.key!,
        ...data
      });
    }
  });
  
  return sessions.sort((a, b) => b.startTime - a.startTime);
}