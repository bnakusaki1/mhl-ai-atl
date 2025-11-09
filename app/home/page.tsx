"use client";

import Image from "next/image";
import { getPromotedMovies, Movie } from "@/lib/server/movies";
import { Icons } from "@/public/assets";
import { Icon } from "@iconify/react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [fetchingPromotedMovies, setFetchingPromotedMovies] = useState(true);
  const [promotedMovies, setPromotedMovies] = useState<Movie[]>();
  const router = useRouter();

  const onGetPromotedMovies = useCallback(async () => {
    try {
      setFetchingPromotedMovies(true);
      const promotedMovies: Movie[] = await getPromotedMovies();
      setPromotedMovies(promotedMovies);
    } finally {
      setFetchingPromotedMovies(false);
    }
  }, []);

  useEffect(() => {
    onGetPromotedMovies();
  }, []);

  return (
    <main className="pt-20 min-h-[100svh]">
      {fetchingPromotedMovies || !promotedMovies ? (
        <div className="w-full h-full min-h-[calc(100svh-80px)] flex items-center justify-center">
          <Icon icon={Icons.loading} />
        </div>
      ) : (
        <div className="w-full max-w-5xl mx-auto h-full">
          <div className="grid grid-cols-2 gap-5 pt-5">
            {promotedMovies.map((movie, index) => (
              <div
                key={index}
                onClick={() => {
                  router.push(`/m/${movie.movieId}`);
                }}
                className="space-y-3 bg-black/5 hover:bg-10 transition cursor-pointer px-2 pt-2 pb-5 rounded-3xl hover:scale-102 active:scale-100 duration-300"
              >
                <div
                  key={index}
                  className="aspect-video rounded-2xl bg-black/5 overflow-hidden"
                >
                  <Image
                    src={`https://img.youtube.com/vi/${movie.movieId}/maxresdefault.jpg`}
                    width={1000}
                    height={1000}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="px-2 font-bold text-lg">{movie.title}</p>
                  <p className="px-2 font-semibold text-black/50 leading-none">
                    Horror | Youtube
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

