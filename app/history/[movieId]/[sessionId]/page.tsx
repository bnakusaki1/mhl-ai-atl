"use client";

import { auth } from "@/firebase.config";
import {
  EmotionDataPoint,
  getWatchSessionById,
  getWatchSessionsByMovieId,
  WatchSession,
} from "@/lib/server/emotions";
import { Icons } from "@/public/assets";
import { Icon } from "@iconify/react";
import { min } from "date-fns";
import { use, useCallback, useEffect, useState } from "react";

export default function SessionDetailsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<WatchSession>();
  const [emotions, setEmotions] = useState<EmotionDataPoint[]>();

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const { session, emotions } = await getWatchSessionById(sessionId);
      setSession(session);
      setEmotions(emotions);
    } catch (e) {
      console.log(`Failed to fetch watch session: ${e}`);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!session) fetchSessions();
  }, []);

  if (!session || loading || !emotions)
    return (
      <div className="w-full h-full min-h-[calc(100svh-80px)] flex items-center justify-center">
        <Icon icon={Icons.loading} />
      </div>
    );

  return (
    <main className="mx-auto max-w-5xl h-full pt-20 pb-20">
      <div className="pt-5 flex justify-between w-full gap-10">
        <div className="px-4 py-5 bg-black/5 w-160 rounded-3xl h-fit sticky top-25">
          <p className="font-bold text-2xl">Watch session</p>
          <div className="pt-4">
            <div className="space-y-2">
              <div className="flex justify-between gap-4">
                <p className="font-bold">Movie:</p>
                <p className="text-right font-medium">{session.videoTitle}</p>
              </div>
              <div className="flex justify-between gap-4">
                <p className="font-bold">Started on:</p>
                <p className="text-right font-medium">
                  {new Date(session.startTime).toDateString()}
                  &nbsp;|&nbsp;
                  {new Date(session.startTime).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex justify-between gap-4">
                <p className="font-bold">Average BPM:</p>
                <p className="text-right font-medium">
                  {session.averageBPM || "N/A"}
                </p>
              </div>
              <div className="flex justify-between gap-4">
                <p className="font-bold">Dominant emotion:</p>
                <p className="text-right font-medium">
                  {session.dominantEmotion || "N/A"}
                </p>
              </div>
              <div className="flex justify-between gap-4">
                <p className="font-bold">Duration:</p>
                <p className="text-right font-medium">
                  {session.duration || "N/A"}
                </p>
              </div>
            </div>
            <div className="space-y-2 pt-5 border-t mt-5 border-black/20">
              <p className="font-bold text-lg">Emotions summary</p>
              <div className="flex justify-between gap-4">
                <p className="font-bold">CALM rating:</p>
                <p className="text-right font-medium">
                  {session.emotionSummary.calm || "N/A"}
                </p>
              </div>
              <div className="flex justify-between gap-4">
                <p className="font-bold">EXCITEMENT rating:</p>
                <p className="text-right font-medium">
                  {session.emotionSummary.excitement || "N/A"}
                </p>
              </div>
              <div className="flex justify-between gap-4">
                <p className="font-bold">FEAR rating:</p>
                <p className="text-right font-medium">
                  {session.emotionSummary.fear || "N/A"}
                </p>
              </div>
              <div className="flex justify-between gap-4">
                <p className="font-bold">JOY rating:</p>
                <p className="text-right font-medium">
                  {session.emotionSummary.joy || "N/A"}
                </p>
              </div>
              <div className="flex justify-between gap-4">
                <p className="font-bold">SADNESS rating:</p>
                <p className="text-right font-medium">
                  {session.emotionSummary.sadness || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-5 w-full">
          {emotions.map((emotion, index) => {
            const timestamp = Math.ceil(emotion.timestamp);
            const minutes = Math.ceil(timestamp / 60);
            const seconds = timestamp % 60;

            return (
              <div key={index} className="w-full flex  gap-5">
                {
                  <p className="font-bold w-14">
                    {minutes < 10 ? `0${minutes}` : minutes}&nbsp;:&nbsp;
                    {seconds < 10 ? `0${seconds}` : seconds}
                  </p>
                }
                <div className="border-l border-[#eee] w-full px-4 pb-4">
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">Emotion:&nbsp;</span>
                      {emotion.emotion.charAt(0).toUpperCase() +
                        emotion.emotion.slice(1)}
                    </p>
                    <p>
                      <span className="font-semibold">Confidence:&nbsp;</span>
                      {emotion.confidence}/1
                    </p>
                    <p>
                      <span className="font-semibold">Reasoning:&nbsp;</span>
                      {emotion.reasoning}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
