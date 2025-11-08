import { Activity } from "lucide-react";
import Link from "next/link";
import { AppProfileMenu } from "../home/components/ProfileMenu";

export function Header() {
  return (
    <header className="w-full fixed inset-0 py-4 px-4 h-fit flex items-center justify-center bg-[var(--background)] z-[100]">
      <div className="w-full max-w-5xl flex items-center justify-between">
        <Link href="/" className="font-bold flex items-center gap-2">
          <Activity />
          <p className="font-bold text-xl">BioTune</p>
        </Link>
        <AppProfileMenu />
      </div>
    </header>
  );
}
