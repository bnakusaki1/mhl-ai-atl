"use client";

import Image from "next/image";
import { auth } from "@/firebase.config";
import { getWatchSessionsByMovieId, WatchSession } from "@/lib/server/emotions";
import { Icons } from "@/public/assets";
import { Icon } from "@iconify/react";
import { use, useCallback, useEffect, useState } from "react";
import { getMovieById, Movie } from "@/lib/server/movies";
import { TvMinimalPlay } from "lucide-react";
import Link from "next/link";

export default function MovieHistory({
  params,
}: {
  params: Promise<{ movieId: string }>;
}) {
  const { movieId } = use(params);
  const [fetchingSessions, setFetchingSessions] = useState(true);
  const [sessions, setSessions] = useState<WatchSession[]>();
  const [movie, setMovie] = useState<Movie>();

  const fetchSessions = useCallback(async () => {
    try {
      setFetchingSessions(true);
      const movie = await getMovieById(movieId);
      setMovie(movie);

      await auth.authStateReady();
      if (auth.currentUser) {
        const sessions = await getWatchSessionsByMovieId(
          auth.currentUser.uid,
          movieId
        );

        setSessions(sessions);
      } else {
        throw Error("No user found");
      }
    } catch (e) {
      console.log(`Failed to fetch sessions: ${e}`);
    } finally {
      setFetchingSessions(false);
    }
  }, [movieId]);

  useEffect(() => {
    if (!sessions) fetchSessions();
  }, []);

  if (!sessions || fetchingSessions || !movie)
    return (
      <div className="w-full h-full min-h-[calc(100svh-80px)] flex items-center justify-center">
        <Icon icon={Icons.loading} />
      </div>
    );

  return (
    <main className="mx-auto max-w-5xl h-full pt-20 pb-20">
      <div className="pt-5">
        <div className="aspect-video rounded-2xl bg-black/5 overflow-hidden w-full">
          <Image
            src={`https://img.youtube.com/vi/${movie.movieId}/maxresdefault.jpg`}
            width={1000}
            height={1000}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-3xl font-semibold pt-5">{movie.title}</p>
        <div className="pt-20">
          <div className="flex items-center gap-3 pb-10">
            <TvMinimalPlay size={35} />
            <p className="font-semibold leading-none text-3xl text-black/70">
              Watch sessions
            </p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {sessions.map((session, index) => (
              <Link
                href={`/history/${movieId}/${session.id}`}
                key={index}
                className="bg-black/5 rounded-3xl  p-4 hover:bg-black/10"
              >
                <div className="flex justify-between">
                  <p className="font-semibold">Started on:&nbsp;</p>
                  <p>
                    {new Date(session.startTime).toDateString()}
                    &nbsp;|&nbsp;
                    {new Date(session.startTime).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="font-semibold">Average BPM:&nbsp;</p>
                  <p>{session.averageBPM || "N/A"}</p>
                </div>
                <div className="flex justify-between">
                  <p className="font-semibold">Dominant emotion:&nbsp;</p>
                  <p>{session.dominantEmotion || "N/A"}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
