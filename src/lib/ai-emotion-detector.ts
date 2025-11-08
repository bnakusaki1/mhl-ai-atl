import OpenAI from 'openai'; //import OpenAI

const openai = new OpenAI({ //Initialize OpenAi Client
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIEmotionResult { //AI will return an object with these properties
  emotion: 'calm' | 'neutral' | 'engaged' | 'excited' | 'intense' | 'anxious' | 'fearful';
  arousal: number; //Activation level from 0.0 to 1.0
  valence: number; //Pleasure level from -1.0 to 1.0
  label: string; //Human-readable label
  color: string; //Hex Color for display 
  confidence: number; //How sure the AI is when reading the BPM
  reasoning: string; //Why the Ai chose this emotion
}

//BPM History is an array of numbers representing heart rate data over time
export async function analyzeEmotionWithAI(bpmHistory: number[]): Promise<AIEmotionResult> {
  if (bpmHistory.length === 0) { //If there is no data we should return neutral 
    return {
      emotion: 'neutral',
      arousal: 0.5,
      valence: 0,
      label: 'Neutral',
      color: '#6b7280',
      confidence: 0,
      reasoning: 'No data available'
    };
  }

  const recentData = bpmHistory; //Reads full duration of the BPM history
  const baseline = Math.round(recentData.slice(0, 10).reduce((a, b) => a + b, 0) / 10) || 70; //Baseline is the average of the first 10 seconds 
  const current = recentData[recentData.length - 1]; //Current BPM is the last data point
  const avg = Math.round(recentData.reduce((a, b) => a + b, 0) / recentData.length); //Calculate average BPM 
  const max = Math.max(...recentData); //Calculate max BPM
  const min = Math.min(...recentData); //Calculate min BPM
  const variance = recentData.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / recentData.length; //Calculate variance
  const stdDev = Math.round(Math.sqrt(variance)); //Standard deviation for variability

  // === Construct the prompt for the AI model ===

  const prompt = `You are an expert psychophysiologist. Analyze heart rate data and determine emotional state.

Heart rate data (last 30 seconds): ${recentData.join(', ')}

Statistics:
- Baseline: ${baseline} BPM
- Current: ${current} BPM  
- Average: ${avg} BPM
- Range: ${min}-${max} BPM
- Variability (SD): ${stdDev}

Return ONLY valid JSON (no markdown, no explanation):

{
  "emotion": "calm|neutral|engaged|excited|intense|anxious|fearful",
  "arousal": 0.0-1.0,
  "valence": -1.0 to 1.0,
  "label": "descriptive label",
  "color": "#hexcolor",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`;
// === Call the OpenAI API ===
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cheapest model
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3, //Low temperature for more focused responses
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content || '{}';
    const result = JSON.parse(content);
    
    return result as AIEmotionResult;
    
  } catch (error) { //Fallback mechanism in case of API failure
    console.error('OpenAI API error:', error);
    
    const delta = current - baseline;
    return {
      emotion: delta > 20 ? 'excited' : delta < -10 ? 'calm' : 'neutral',
      arousal: Math.min(1, Math.max(0, delta / 40)),
      valence: 0,
      label: 'Analyzing...',
      color: '#6b7280',
      confidence: 0.5,
      reasoning: 'Using fallback analysis'
    };
  }
}