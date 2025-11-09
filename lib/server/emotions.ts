"use server";

import { initAdmin } from "@/firebase.admin.config";
import { Movie } from "./movies";
import { QuerySnapshot } from "firebase-admin/firestore";

export interface EmotionDataPoint {
  id?: string;
  timestamp: number;
  emotion: string;
  arousal: number;
  valence: number;
  bpm: number;
  sceneDescription: string;
  reasoning: string;
  confidence: number;
  capturedAt: number;
}

export interface WatchSession {
  id?: string;
  userId: string;
  videoId: string;
  videoTitle: string;
  startTime: number;
  endTime?: number;
  duration: number;
  emotions: EmotionDataPoint[];
  averageBPM: number;
  dominantEmotion: string;
  emotionSummary: {
    fear: number;
    excitement: number;
    sadness: number;
    joy: number;
    calm: number;
  };
}

// Save emotion data point during watching
export async function saveEmotionDataPoint(
  sessionId: string,
  emotion: EmotionDataPoint
): Promise<void> {
  const firestore = initAdmin().firestore();
  const emotionRef = firestore
    .collection("Sessions")
    .doc(sessionId)
    .collection("Emotions")
    .doc();
  emotion.id = emotionRef.id;
  await emotionRef.set(emotion);
}

// Create new watch session
export async function createWatchSession(
  userId: string,
  videoId: string
): Promise<string> {
  const sessionsRef = initAdmin().firestore().collection("Sessions").doc();
  const movieSnapshot = await initAdmin()
    .firestore()
    .collection("PromotedMovies")
    .doc(videoId)
    .get();
  const movie: Movie = movieSnapshot.data() as Movie;

  const session: WatchSession = {
    id: sessionsRef.id,
    userId,
    videoId,
    videoTitle: movie.title,
    startTime: Date.now(),
    emotions: [],
    averageBPM: 0,
    dominantEmotion: "",
    duration: 0,
    emotionSummary: {
      fear: 0,
      excitement: 0,
      sadness: 0,
      joy: 0,
      calm: 0,
    },
  };

  await sessionsRef.set(session);
  return sessionsRef.id;
}

// End session and calculate summary
export async function endWatchSession(sessionId: string): Promise<void> {
  const firestore = initAdmin().firestore();

  const emotionsSnapshot = await firestore
    .collection("Sessions")
    .doc(sessionId)
    .collection("Emotions")
    .get();
  const emotions: EmotionDataPoint[] = emotionsSnapshot.docs.map(
    (doc) => doc.data() as EmotionDataPoint
  );

  // Calculate statistics
  const avgBPM = emotions.reduce((sum, e) => sum + e.bpm, 0) / emotions.length;
  // Count emotions
  const emotionCounts: Record<string, number> = {};
  emotions.forEach((e) => {
    emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
  });
  // Find dominant emotion
  const dominantEmotion = Object.entries(emotionCounts).sort(
    ([, a], [, b]) => b - a
  )[0][0];
  // Calculate percentages
  const total = emotions.length;
  const emotionSummary = Object.fromEntries(
    Object.entries(emotionCounts).map(([emotion, count]) => [
      emotion,
      Math.round((count / total) * 100),
    ])
  );
  // Update session
  const sessionRef = firestore.collection("Sessions").doc(sessionId);
  const update: Partial<WatchSession> = {
    endTime: Date.now(),
    averageBPM: Math.round(avgBPM),
    dominantEmotion,
    emotionSummary: emotionSummary as any,
    duration: emotions[emotions.length - 1]?.timestamp || 0,
  };
  await sessionRef.update(update);
}

// // Get user's watch history
// export async function getUserWatchHistory(
//   userId: string
// ): Promise<WatchSession[]> {
//   const sessionsRef = ref(db, `sessions`);
//   const userSessionsQuery = query(sessionsRef, orderByChild("userId"));
//   const snapshot = await get(userSessionsQuery);
//   if (!snapshot.exists()) return [];
//   const sessions: WatchSession[] = [];
//   snapshot.forEach((child) => {
//     const data = child.val();
//     if (data.userId === userId) {
//       sessions.push({
//         id: child.key!,
//         ...data,
//       });
//     }
//   });
//   return sessions.sort((a, b) => b.startTime - a.startTime);
// }

export async function getWatchSessionsByMovieId(
  userId: string,
  movieId: string
): Promise<WatchSession[]> {
  const querySnapshot: QuerySnapshot = await initAdmin()
    .firestore()
    .collection("Sessions")
    .where("userId", "==", userId)
    .where("videoId", "==", movieId)
    .orderBy("startTime", "desc")
    .get();

  return querySnapshot.docs.map((doc) => doc.data() as WatchSession);
}

export async function getWatchSessionById(
  sessionId: string
): Promise<{ session: WatchSession; emotions: EmotionDataPoint[] }> {
  const firestore = initAdmin().firestore();
  const docSnapshot = await firestore
    .collection("Sessions")
    .doc(sessionId)
    .get();
  const session: WatchSession = docSnapshot.data() as WatchSession;

  const emotionsSnapshot = await firestore
    .collection("Sessions")
    .doc(sessionId)
    .collection("Emotions")
    .orderBy("capturedAt", "desc")
    .get();

  const emotions: EmotionDataPoint[] = emotionsSnapshot.docs.map(
    (doc) => doc.data() as EmotionDataPoint
  );

  return { session, emotions };
}
