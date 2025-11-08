"use client";

import Image from "next/image";
import { auth } from "@/firebase.config";
import { listUserHistory, UserHistory } from "@/lib/server/history";
import { Icons } from "@/public/assets";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { History } from "lucide-react";

export default function HistoryPage() {
  const [userHistory, setUserHistory] = useState<UserHistory>();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const onFetchUserHistory = useCallback(async () => {
    try {
      setLoading(true);
      await auth.authStateReady();
      if (auth.currentUser) {
        const history = await listUserHistory(auth.currentUser.uid);
        setUserHistory(history);
      }
    } catch (e) {
      console.log(`Failed to fetch user history: ${e}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    onFetchUserHistory();
  }, []);

  return (
    <main className="pt-20 min-h-[100svh] pb-20">
      {loading || !userHistory ? (
        <div className="w-full h-full min-h-[calc(100svh-80px)] flex items-center justify-center">
          <Icon icon={Icons.loading} />
        </div>
      ) : (
        <div className="w-full max-w-5xl mx-auto h-full">
          <div className="flex items-center gap-2 pt-5 mb-5">
            <History size={30} />
            <h1 className="font-bold text-3xl">Watch history</h1>
          </div>
          <div className="grid grid-cols-1 gap-5 pt-5">
            {userHistory.history.map((movie, index) => (
              <div key={index} className="flex  items-start gap-5">
                <p className="font-bold text-2xl w-5 py-2">{index + 1}.</p>
                <div
                  onClick={() => {
                    router.push(`/history/${movie.movieId}`);
                  }}
                  className="hover:bg-black/5 transition cursor-pointer rounded-3xl hover:scale-102 active:scale-100 duration-300 flex gap-5 w-full p-2"
                >
                  <div
                    key={index}
                    className="aspect-video rounded-2xl bg-black/5 overflow-hidden max-w-sm"
                  >
                    <Image
                      src={movie.thumbnailPath}
                      width={1000}
                      height={1000}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="px-2 font-bold text-lg">{movie.movieTitle}</p>
                    <p className="px-2 font-semibold text-black/50 leading-none mb-3">
                      Horror | Youtube
                    </p>
                    <p className="px-2 font-semibold text-black/50 leading-none">
                      Watched on&nbsp;
                      {new Date(movie.watchedOnMillis).toDateString()}
                      &nbsp;|&nbsp;
                      {new Date(movie.watchedOnMillis).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
