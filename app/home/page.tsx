"use client";

import { getPromotedMovies, Movie } from "@/lib/server/movies";
import { Icons } from "@/public/assets";
import { Icon } from "@iconify/react";
import { useCallback, useEffect, useState } from "react";
import { PromotedMoviesCarousel } from "./components/MoviesCarousel";

export default function HomePage() {
  const [fetchingPromotedMovies, setFetchingPromotedMovies] = useState(true);
  const [promotedMovies, setPromotedMovies] = useState<Movie[]>();

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
    <main className="pt-20">
      {fetchingPromotedMovies || !promotedMovies ? (
        <div className="w-full h-full flex items-center justify-center">
          <Icon icon={Icons.loading} />
        </div>
      ) : (
        <div>
          <PromotedMoviesCarousel
            promotedMovies={promotedMovies.map((movie) => ({
              movieTitle: movie.title,
              thumbnailPath: movie.thumbnailPath,
              movieId: movie.movieId,
            }))}
          />
        </div>
      )}
    </main>
  );
}
