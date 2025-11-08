"use client";

import { auth } from "@/firebase.config";
import { Movie } from "@/lib/server/movies";
import { AnimatePresence, motion } from "framer-motion";
import { History, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function AppProfileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const histories: HistoryItem[] = [
    {
      movie: {
        movieId: "",
        title: "Sinners",
        thumbnailPath: "",
      },
      watchedOn: "Nov 8, 2025 11:52AM",
    },
    {
      movie: {
        movieId: "",
        title: "IT",
        thumbnailPath: "",
      },
      watchedOn: "Nov 10, 2025 11:52AM",
    },
    {
      movie: {
        movieId: "",
        title: "Morbius",
        thumbnailPath: "",
      },
      watchedOn: "Dec 8, 2025 11:52AM",
    },
  ];

  return (
    <>
      <button
        id="profile-menu-icon"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`aspect-square rounded-full h-10 w-10 flex items-center justify-center cursor-pointer ${
          isMenuOpen
            ? "z-[1000] bg-[var(--background)]"
            : "bg-black/5 hover:bg-black/10"
        }`}
      >
        <AnimatePresence initial={false} mode="wait">
          {isMenuOpen ? (
            <motion.div
              key="close-icon"
              initial={{ opacity: 0.5, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.5, scale: 0.0 }}
            >
              <X size={18} />
            </motion.div>
          ) : (
            <motion.div
              key="menu-icon"
              initial={{ opacity: 0.5, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.5, scale: 0.0 }}
            >
              <Menu size={18} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
      <AnimatePresence>
        {isMenuOpen && (
          <AgentPageHeaderMenu
            menuItems={histories}
            onClose={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function AgentPageHeaderMenu({
  menuItems,
  onClose,
}: {
  menuItems: HistoryItem[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [userName, setUserName] = useState<string>();
  const [userEmail, setUserEmail] = useState<string>();
  const [profileButtonRect, setProfileButtonRect] = useState<DOMRect>();

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("nav") && !target.closest("button")) {
        onClose();
      }
    };

    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  });

  useEffect(() => {
    const profileButton = document.getElementById("profile-menu-icon");
    if (profileButton) {
      setProfileButtonRect(profileButton.getBoundingClientRect());
    }
  }, [window.innerWidth, window.innerHeight]);

  useEffect(() => {
    const setUserNameAndEmail = async () => {
      await auth.authStateReady();
      const currentUser = auth.currentUser;
      setUserEmail(currentUser?.email || undefined);
      setUserName(currentUser?.displayName || undefined);
    };

    setUserNameAndEmail();
  }, []);

  if (!profileButtonRect) return <></>;

  return (
    <>
      <div className="fixed inset-0 w-screen h-screen bg-black/50 z-[100]" />
      <motion.nav
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-[1000] flex flex-col w-[300px] bg-[var(--background)] rounded-3xl shadow-lg border border-[#eee]"
        style={{
          top: profileButtonRect.bottom + 5,
          left: profileButtonRect.right - 300,
        }}
      >
        <div>
          <div className="pt-5 px-[18px] border-b-2 border-[#eee] pb-4">
            <p className="font-bold">{userName}</p>
            <p className="text-sm font-semibold">{userEmail}</p>
          </div>
          <div className="flex items-center justify-between gap-2 px-4 pt-4">
            <div className="flex items-center gap-2">
              <History size={20} />
              <p className="font-semibold text-lg">Watch history</p>
            </div>
            <Link
              href="/history"
              onClick={() => {
                onClose();
              }}
              className="text-sm font-semibold bg-black/5 px-4 py-1 rounded-full cursor-pointer hover:bg-black/10"
            >
              View all
            </Link>
          </div>
          <div className="px-2 pb-5 pt-4">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className="w-full px-[10px] py-2 h-13 w-full cursor-pointer flex items-center gap-4 hover:bg-black/5 cursor-pointer"
              >
                <div className="aspect-video h-full bg-black/5"></div>
                <div className="flex flex-col items-start">
                  <p className="font-semibold">{item.movie.title}</p>
                  <p className="font-semibold text-sm text-black/70">
                    {item.watchedOn}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.nav>
    </>
  );
}

type HistoryItem = {
  movie: Movie;
  watchedOn: String;
};
