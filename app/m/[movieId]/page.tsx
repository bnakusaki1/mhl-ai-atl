"use client";

import { Icons } from "@/public/assets";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LiveHeartRateGraph } from "./components/Graph";
import { addToUserHistory } from "@/lib/server/history";
import { auth } from "@/firebase.config";

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
  const [playerState, setPlayerState] = useState<string>("Unstarted");

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
    const states: { [key: number]: string } = {
      [-1]: "Unstarted",
      [0]: "Ended",
      [1]: "Playing",
      [2]: "Paused",
      [3]: "Buffering",
      [5]: "Video cued",
    };

    const state = states[event.data] || "Unknown";
    setPlayerState(state);

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
            <p className="font-bold text-4xl leading-none">101 BPM</p>
            <p className="leading-none font-medium text-black/50 mt-[1px]">
              Heart rate
            </p>
          </div>
        </div>
        <div>
          <p className="font-semibold text-3xl text-right">Fear</p>
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
        <LiveHeartRateGraph />
      </div>
    </main>
  );
}
