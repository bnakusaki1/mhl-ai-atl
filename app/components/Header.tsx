"use client";

import { Activity } from "lucide-react";
import Link from "next/link";
import { AppProfileMenu } from "../home/components/ProfileMenu";
import { useCallback, useEffect, useState } from "react";
import { listUserHistory, UserHistory } from "@/lib/server/history";
import { auth } from "@/firebase.config";

export function Header() {
  const [userHistory, setUserHistory] = useState<UserHistory>();

  const onFetchUserHistory = useCallback(async () => {
    try {
      await auth.authStateReady();
      if (auth.currentUser) {
        const history = await listUserHistory(auth.currentUser.uid);
        setUserHistory(history);
      }
    } catch (e) {
      console.log(`Failed to fetch user history: ${e}`);
    }
  }, []);

  useEffect(() => {
    onFetchUserHistory();
  }, []);

  return (
    <header className="w-full fixed inset-0 py-4 px-4 h-fit flex items-center justify-center bg-[var(--background)] z-[100]">
      <div className="w-full max-w-5xl flex items-center justify-between">
        <Link href="/home" className="font-bold flex items-center gap-2">
          <Activity />
          <p className="font-bold text-xl">BioTune</p>
        </Link>
        <AppProfileMenu history={userHistory?.history || []} />
      </div>
    </header>
  );
}
