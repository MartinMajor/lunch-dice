import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[40rem] text-white/[0.02] font-display leading-none">✕</span>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <p className="font-display text-gold/30 tracking-widest text-xs uppercase">Error</p>
        <h1 className="font-display text-8xl text-gold tracking-widest">404</h1>
        <p className="text-cream/50 text-sm tracking-wider">
          This page doesn&apos;t exist.
        </p>
        <div className="w-32 h-px bg-gold/20" />
        <Link
          href="/"
          className="bg-gold text-casino-black font-display tracking-widest text-sm
                     py-3 px-6 rounded-lg transition-colors hover:bg-gold-light"
        >
          NEW GAME
        </Link>
      </div>
    </main>
  );
}
