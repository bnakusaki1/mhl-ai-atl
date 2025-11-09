"use client";

import { Activity } from "lucide-react";
import Link from "next/link";
import { AppProfileMenu } from "../home/components/ProfileMenu";
import { useCallback, useEffect, useState } from "react";
import { listUserHistory, UserHistory } from "@/lib/server/history";
import { auth } from "@/firebase.config";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
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
        <Link
          href="/home"
          className="font-bold flex items-center gap-2 text-orange-600"
        >
          <Activity />
          <p className="font-bold text-xl">BioTune</p>
        </Link>
        {pathname === "/" ? (
          <Link
            href="/login"
            className="h-10 px-5 bg-black/5 rounded-full text-sm font-bold flex items-center justify-center hover:bg-black/10"
          >
            Log in
          </Link>
        ) : (
          <AppProfileMenu history={userHistory?.history || []} />
        )}
      </div>
    </header>
  );
}
