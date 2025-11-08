"use server";

import { initAdmin } from "@/firebase.admin.config";
import {
  DocumentReference,
  DocumentSnapshot,
  FieldValue,
} from "firebase-admin/firestore";
import { Movie } from "./movies";

export async function listUserHistory(uid: string): Promise<UserHistory> {
  const docRef: DocumentReference = initAdmin()
    .firestore()
    .collection("UserWatchHistory")
    .doc(uid);

  const docSnapshot: DocumentSnapshot = await docRef.get();

  if (docSnapshot.exists) {
    return { history: (docSnapshot.data() as UserHistory).history.reverse() };
  } else {
    return { history: [] };
  }
}

export async function addToUserHistory(
  uid: string,
  movieId: string
): Promise<void> {
  const docRef: DocumentReference = initAdmin()
    .firestore()
    .collection("UserWatchHistory")
    .doc(uid);

  const docSnapshot: DocumentSnapshot = await docRef.get();

  if (docSnapshot.exists) {
    const userHistory: UserHistory = docSnapshot.data() as UserHistory;

    if (
      userHistory.history[userHistory.history.length - 1]?.movieId !== movieId
    ) {
      const movieDocSnap: DocumentSnapshot = await initAdmin()
        .firestore()
        .collection("PromotedMovies")
        .doc(movieId)
        .get();
      const movie: Movie = movieDocSnap.data() as Movie;

      const newHistory: History = {
        movieId: movieId,
        movieTitle: movie.title,
        thumbnailPath: movie.thumbnailPath,
        watchedOnMillis: Date.now(),
      };

      await docRef.update({ history: FieldValue.arrayUnion(newHistory) });
    }
  } else {
    const movieDocSnap: DocumentSnapshot = await initAdmin()
      .firestore()
      .collection("PromotedMovies")
      .doc(movieId)
      .get();
    const movie: Movie = movieDocSnap.data() as Movie;

    const newHistory: History = {
      movieId: movieId,
      movieTitle: movie.title,
      thumbnailPath: movie.thumbnailPath,
      watchedOnMillis: Date.now(),
    };

    const userHistory: UserHistory = {
      history: [newHistory],
    };

    await docRef.set(userHistory);
  }
}

export type History = {
  movieId: string;
  movieTitle: string;
  thumbnailPath: string;
  watchedOnMillis: number;
};

export type UserHistory = {
  history: History[];
};
