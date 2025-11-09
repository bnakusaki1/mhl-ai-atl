"use server"

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type ContextualEmotionResult = {
  emotion:
    | "fear"
    | "excitement"
    | "sadness"
    | "joy"
    | "anger"
    | "disgust"
    | "surprise"
    | "calm";
  arousal: number;
  valence: number;
  sceneDescription: string;
  reasoning: string;
  confidence: number;
  color: string;
};

export async function analyzeWithVideoContext({
  videoUrl,
  currentBPM,
  recentBPMHistory,
  timestamp,
}: {
  videoUrl: string;
  currentBPM: number;
  recentBPMHistory: number[];
  timestamp: number;
}): Promise<ContextualEmotionResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  
  // Extract video ID from YouTube URL
  const videoIdMatch = videoUrl.match(/embed\/([^?]+)/);
  const videoId = videoIdMatch ? videoIdMatch[1] : '';
  
  if (!videoId) {
    throw new Error("Invalid YouTube video URL");
  }

  // Calculate statistics
  const avgBPM =
    recentBPMHistory.length > 0
      ? Math.round(
          recentBPMHistory.reduce((a, b) => a + b, 0) / recentBPMHistory.length
        )
      : currentBPM;
  const baseline = 70;
  const delta = currentBPM - baseline;
  const bpmTrend = recentBPMHistory.length >= 3
    ? recentBPMHistory[recentBPMHistory.length - 1] - recentBPMHistory[recentBPMHistory.length - 3]
    : 0;
  
  const minutes = Math.floor(timestamp / 60);
  const seconds = Math.floor(timestamp) % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  // Create the AI prompt with video context
  const aiPrompt = `You are an expert in psychophysiology and film analysis.

**YOUR TASK:**
Analyze the viewer's emotional response to a YouTube video by examining their heart rate data and the video context.

**VIDEO INFORMATION:**
- YouTube Video ID: ${videoId}
- Full YouTube URL: https://www.youtube.com/watch?v=${videoId}
- Current timestamp in video: ${timeStr} (${Math.floor(timestamp)} seconds)
- You can reference this specific moment in the video to understand what scene the viewer is experiencing

**HEART RATE DATA:**
- Current BPM: ${currentBPM}
- Recent BPM history (last measurements): [${recentBPMHistory.slice(-10).join(", ")}]
- Average recent BPM: ${avgBPM}
- Baseline (typical resting): ${baseline} BPM
- Change from baseline: ${delta > 0 ? "+" : ""}${delta} BPM
- BPM trend: ${bpmTrend > 0 ? "increasing" : bpmTrend < 0 ? "decreasing" : "stable"} (${bpmTrend > 0 ? "+" : ""}${bpmTrend})

**YOUR ANALYSIS PROCESS:**
1. Consider what typically happens at timestamp ${timeStr} in videos (beginning, middle, climax, ending)
2. Analyze the heart rate pattern:
   - Sudden spike = surprise, fear, or excitement
   - Gradual increase = building tension or excitement
   - High sustained = fear, excitement, or anger
   - Decrease = relief, sadness, or calm
   - Low/stable = calm, boredom, or sadness
3. Combine video timing context with physiological response
4. Distinguish between similar heart rate patterns using context

**CRITICAL DISTINCTIONS:**
- High BPM + sudden spike = likely FEAR or SURPRISE (jump scare, shocking moment)
- High BPM + sustained elevation = EXCITEMENT or ANGER (action scene, conflict)
- Elevated BPM + decreasing trend = SADNESS (emotional scene causing physiological response)
- Moderate BPM + stable = JOY or CALM (pleasant scene)
- High BPM + specific context = DISGUST (disturbing content)

**OUTPUT FORMAT:**
Return ONLY valid JSON (no markdown, no code blocks, no preamble):

{
  "emotion": "fear|excitement|sadness|joy|anger|disgust|surprise|calm",
  "arousal": 0.85,
  "valence": -0.6,
  "sceneDescription": "Brief inference about what the scene at  ${timeStr} of the youtube video provided.",
  "reasoning": "Explain your analysis connecting the timestamp context, heart rate pattern, and chosen emotion",
  "confidence": 0.9,
  "color": "#ef4444"
}

**EMOTION COLORS (use these exactly):**
- fear: "#8b0000"
- excitement: "#ff6b35"
- sadness: "#4a90e2"
- joy: "#ffd700"
- anger: "#dc2626"
- disgust: "#16a34a"
- surprise: "#a855f7"
- calm: "#10b981"

**EXAMPLE REASONING:**
"At ${timeStr}, combined with a sudden heart rate spike from ${avgBPM} to ${currentBPM} BPM (+${delta}), this suggests the viewer experienced a ${bpmTrend > 10 ? "shocking or frightening moment" : "significant emotional response"}. The ${bpmTrend > 0 ? "sharp increase" : "pattern"} indicates ${delta > 20 ? "a stress response typical of fear or surprise" : "an emotional engagement"}."

Analyze the physiological data in context of the video timestamp and provide your assessment.`;

  try {
    const result = await model.generateContent(aiPrompt);
    const response = result.response;
    const text = response.text();

    // Clean up any markdown formatting
    const cleanText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    return JSON.parse(cleanText) as ContextualEmotionResult;
  } catch (error) {
    console.error("Gemini API error:", error);

    // Fallback emotion based on BPM patterns
    let emotion: ContextualEmotionResult['emotion'] = "calm";
    let color = "#10b981";
    
    if (Math.abs(bpmTrend) > 10) {
      emotion = bpmTrend > 0 ? "surprise" : "calm";
      color = bpmTrend > 0 ? "#a855f7" : "#10b981";
    } else if (delta > 20) {
      emotion = "excitement";
      color = "#ff6b35";
    } else if (delta < -10) {
      emotion = "calm";
      color = "#10b981";
    } else {
      emotion = "surprise";
      color = "#a855f7";
    }

    return {
      emotion,
      arousal: Math.min(1, Math.max(0, Math.abs(delta) / 40)),
      valence: delta > 0 ? 0.3 : -0.3,
      sceneDescription: `Unable to analyze - at ${timeStr} with ${currentBPM} BPM`,
      reasoning: "Using BPM-only fallback analysis due to API error",
      confidence: 0.5,
      color,
    };
  }
}