"use client";

import { use } from "react";

export default function SessionDetailsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);

  return <main></main>;
}
