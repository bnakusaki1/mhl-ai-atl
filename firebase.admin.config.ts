import "server-only";

import admin from "firebase-admin";
import { Credential } from "firebase-admin/app";

export function initAdmin(): admin.app.App {
  const credential: Credential = admin.credential.cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
    clientEmail: process.env.APP_CLIENT_MAIL as string,
    privateKey: (process.env.APP_PRIVATE_KEY as string).replace(/\\n/g, "\n"),
  });

  if (admin.apps.length > 0) return admin.app();

  const app: admin.app.App = admin.initializeApp({
    credential,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  });

  return app;
}
