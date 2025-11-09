"use client";

import { auth, db } from "@/firebase.config";
import {
  analyzeWithVideoContext,
  ContextualEmotionResult,
} from "@/lib/server/emotions-detector";
import { addToUserHistory } from "@/lib/server/history";
import { Icons } from "@/public/assets";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listenToDocument } from "./actions";
import { HeartRateData, LiveHeartRateGraph } from "./components/Graph";

// Extend Window type for YouTube API
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export default function MoviePage({
  params,
}: {
  params: Promise<{ movieId: string }>;
}) {
  const { movieId } = use(params);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [emotionBoxRect, setEmotionBoxRect] = useState<DOMRect>();

  useEffect(() => {
    const profileButton = document.getElementById("emotion box");
    if (profileButton) {
      setEmotionBoxRect(profileButton.getBoundingClientRect());
    }
  }, [window.innerWidth, window.innerHeight]);

  const onStart = useCallback(async () => {
    try {
      if (isPlaying) return;
      await fetch("localhost:5000/start", { method: "post" });
    } catch (e) {
      console.log(`Failed to start heart rate sensor: ${e}`);
    }
  }, []);

  const onStop = useCallback(async () => {
    try {
      if (!isPlaying) return;
      await fetch("localhost:5000/stop", { method: "post" });
    } catch (e) {
      console.log(`Failed to stop heart rate sensor: ${e}`);
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      onStart();
      console.log("Video is playing - start heart rate monitoring");
    } else {
      onStop();
      console.log("Video is paused/ended - pause heart rate monitoring");
    }
  }, [isPlaying]);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("youtube-player", {
        events: {
          onStateChange: onPlayerStateChange,
        },
      });
    };

    // If API is already loaded
    if (window.YT && window.YT.Player) {
      playerRef.current = new window.YT.Player("youtube-player", {
        events: {
          onStateChange: onPlayerStateChange,
        },
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [movieId]);

  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    } else if (event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
    }
  };

  useMemo(() => {
    const addToHistory = async () => {
      console.log("Adding to history");
      await auth.authStateReady();

      if (auth.currentUser) {
        console.log(`Found user: ${auth.currentUser.uid}`);
        await addToUserHistory(auth.currentUser.uid, movieId);
        console.log("Added to history");
      }
    };

    addToHistory();
  }, []);

  useEffect(() => {
    const unsubscribe = listenToDocument(
      db,
      "BPMReadings",
      "readings",
      (update) => {
        console.log(update);
      }
    );

    return () => unsubscribe();
  }, []);

  const [delta, setDelta] = useState(0);
  const [contextualEmotionResponse, setContextualEmotionResponse] =
    useState<ContextualEmotionResult>();
  const [currentBpm, setCurrentBpm] = useState<number>(0);
  const [data, setData] = useState<HeartRateData[]>([]);
  const maxDataPoints = 30; // Keep last 30 readings

  // Simulate receiving live heart rate data
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      // Simulate heart rate data (replace with your actual data source)
      const now = Date.now();
      const bpm = Math.floor(Math.random() * (100 - 60) + 60); // Random BPM between 60-100

      const newDataPoint: HeartRateData = {
        timestamp: new Date(now).toLocaleTimeString(),
        bpm,
        time: now,
      };

      setDelta(bpm - currentBpm);
      setCurrentBpm(bpm);

      setData((prevData) => {
        const updated = [...prevData, newDataPoint];
        // Keep only the last N data points
        return updated.slice(-maxDataPoints);
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (Math.abs(delta) >= 10) {
      const analyze = async () => {
        // Get current video timestamp from YouTube player
        let videoTimestamp = 0;
        if (playerRef.current && playerRef.current.getCurrentTime) {
          try {
            videoTimestamp = playerRef.current.getCurrentTime();
          } catch (error) {
            console.error("Failed to get video timestamp:", error);
          }
        }

        console.log(`Video timestamp: ${videoTimestamp}`);

        const emotionalResponse = await analyzeWithVideoContext({
          videoUrl: `https://www.youtube.com/embed/${movieId}?enablejsapi=1`,
          currentBPM: currentBpm,
          recentBPMHistory: data.map((point) => point.bpm),
          timestamp: videoTimestamp,
        });
        setContextualEmotionResponse(emotionalResponse);

        console.log(emotionalResponse);
      };

      analyze();
    }
  }, [delta]);

  return (
    <main className="pt-20 w-full max-w-5xl mx-auto pb-20">
      <div className="mb-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              scale: [0.9, 1, 0.9, 1, 0.9],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              times: [0, 0.1, 0.2, 0.3, 1],
            }}
          >
            <Icon
              icon={Icons.heart}
              className="text-6xl leading-none text-red-500"
            />
          </motion.div>
          <div>
            <p className="font-bold text-4xl leading-none">
              {currentBpm ? `${currentBpm} BPM` : "N/A"}{" "}
            </p>
            <p className="leading-none font-medium text-black/50 mt-[1px]">
              Heart rate
            </p>
          </div>
        </div>
        <div id="emotion box">
          <p
            className={`font-semibold text-3xl text-right ${
              contextualEmotionResponse
                ? `text-[${contextualEmotionResponse.color}]`
                : ""
            }`}
            style={{
              color: contextualEmotionResponse?.color,
            }}
          >
            {contextualEmotionResponse
              ? contextualEmotionResponse.emotion.charAt(0).toUpperCase() +
                contextualEmotionResponse.emotion.slice(1)
              : "N/A"}
          </p>
          <p className="leading-none font-medium text-black/50 text-right">
            Emotion detected
          </p>
        </div>
      </div>
      <div className="pt-5 w-full aspect-video rounded-3xl overflow-hidden bg-black/5">
        <iframe
          id="youtube-player"
          width={"100%"}
          height={"100%"}
          src={`https://www.youtube.com/embed/${movieId}?enablejsapi=1`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={true}
        />
      </div>
      <div className="mt-10">
        <LiveHeartRateGraph data={data} />
      </div>
      {contextualEmotionResponse && emotionBoxRect ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-black/5 fixed w-64 rounded-3xl"
          style={{
            top: emotionBoxRect.top,
            left: emotionBoxRect.right + 40
          }}
        >
          <p className="font-semibold">AI Reasoning</p>
          <AnimatePresence initial={false} mode="wait">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key={contextualEmotionResponse.reasoning}
              className="text-sm font-medium mt-2"
            >
              {contextualEmotionResponse.reasoning}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      ) : undefined}
    </main>
  );
}
