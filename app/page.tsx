import { Activity } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="">
      <div className="pt-12 px-3 min-h-[100svh] flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 mb-7 lg:mb-10 bg-orange-50 text-orange-600 rounded-full p-2">
          <div className="aspect-square w-5 h-5 flex items-center justify-center p-1 rounded-full text-xs bg-black text-white">
            <Activity />
          </div>
          <p className="text-sm font-semibold">
            BioTune, the new platform for crafting perfect scares, is now in an
            exclusive Beta for horror production studios.
          </p>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl montserrat text-center font-semibold mb-4 xl:mb-5">
          A New Advantage for Production Studios.
        </h1>
        <p className="text font-medium max-w-2xl text-center text-black/70 mb-6 lg:mb-10">
          BioTune tracks live heart rates as users watch media, using AI to
          compute emotional spikes from BPM variations. A built-in dashboard and
          history feature let you see exactly what <br /> sparks the best
          reactions.
        </p>
        <CallToActionButton />
      </div>
    </main>
  );
}

function CallToActionButton() {
  return (
    <Link
      href="/login"
      className="bg-orange-600 text-white h-14 px-6 rounded-full font-bold hover:bg-pink-700 cursor-pointer flex items-center justify-center"
    >
      Get early access
    </Link>
  );
}
