import { use } from "react";

export default function MoviePage({
  params,
}: {
  params: Promise<{ movieId: string }>;
}) {
  const { movieId } = use(params);

  return (
    <main className="flex items-center justify-center min-h-[100svh] w-full">
      {movieId}
    </main>
  );
}
