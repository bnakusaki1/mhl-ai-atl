"use server";

import { initAdmin } from "@/firebase.admin.config";
import { QuerySnapshot } from "firebase-admin/firestore";

export type Movie = {
  movieId: string;
  title: string;
  thumbnailPath: string;
};

export async function getPromotedMovies(): Promise<Movie[]> {
  const querySnapshot: QuerySnapshot = await initAdmin()
    .firestore()
    .collection("PromotedMovies")
    .get();

  return querySnapshot.docs.map((doc) => doc.data() as Movie);
}
