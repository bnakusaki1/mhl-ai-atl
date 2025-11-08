"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function PromotedMoviesCarousel({
  promotedMovies,
}: {
  promotedMovies: {
    movieTitle: string;
    thumbnailPath: string;
    movieId: string;
  }[];
}) {
  const [indexInFocus, setIndexInFocus] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.clientWidth;
      const newIndex = Math.round(scrollLeft / (cardWidth + 12));

      if (
        newIndex !== indexInFocus &&
        newIndex >= 0 &&
        newIndex < promotedMovies.length
      ) {
        setIndexInFocus(newIndex);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [indexInFocus]);

  const router = useRouter();

  return !promotedMovies.length ? (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      <div className="flex items-center justify-center w-full">
        <div className="w-[calc(100vw-56px)] aspect-[1.05] mx-1 rounded-3xl overflow-hidden bg-black/5 p-3">
          {/* <Image
            src={Images}
            width={1000}
            height={1000}
            alt="Building"
            className="object-fit"
          /> */}
        </div>
      </div>
      <div className="flex items-center justify-center gap-1">
        <p className="font-semibold text-black/60">No images available</p>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      <div
        ref={scrollContainerRef}
        className="w-screen overflow-x-scroll scrollbar-hide hide-scrollbar"
        style={{ scrollSnapType: "x mandatory" }}
      >
        <div
          className="flex items-center justify-center"
          style={{ width: `${promotedMovies.length * 100}%` }}
        >
          {[...promotedMovies].map((image, index) => (
            <div
              key={index}
              className="w-[calc(100vw-56px)] max-w-xl aspect-[1.05] mx-1 rounded-3xl overflow-hidden relative"
              style={{
                scrollSnapAlign: "center",
              }}
              onClick={() => {
                router.push(`/m/${image.movieId}`);
              }}
            >
              <div className="inset-0 absolute w-full h-full bg-black/10 z-10" />
              <div className="absolute z-20 bottom-0 left-0 p-4">
                <h1 className="text-white font-semibold text-2xl">
                  {image.movieTitle}
                </h1>
              </div>
              <Image
                src={image.thumbnailPath}
                width={1000}
                height={1000}
                alt=""
                className="object-cover h-full w-full"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-1">
        {/* TODO: fix index matching with indexInFocus */}
        {Array.from({ length: promotedMovies.length }).map((_, index) => (
          <div
            key={index}
            className={`rounded-full aspect-square h-2 w-2 transition ${
              index === indexInFocus
                ? "scale-100 bg-black/70"
                : "scale-75 bg-black/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
