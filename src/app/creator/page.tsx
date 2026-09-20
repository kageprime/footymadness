import DugoutBuilder from "@/components/creator";

export default function CreatorPage() {
  return (
    <main className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Creator · team sheet · mock</p>
        <h1 className="font-display mt-1 text-4xl uppercase sm:text-6xl">Name your eleven.</h1>
        <p className="mt-2 max-w-prose text-[15px] text-zinc-300">
          One sheet, FM style: shape, shirts, mentality, subs. Tap a shirt then a slot to swap,
          tap a sub then a slot to bring them on. Mock names only.
        </p>
      </div>
      <DugoutBuilder />
    </main>
  );
}
