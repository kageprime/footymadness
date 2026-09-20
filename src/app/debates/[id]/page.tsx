import { notFound } from "next/navigation";
import { debates } from "@/lib/mock";
import ThreadView from "@/components/thread";

export function generateStaticParams() {
  return debates.map((d) => ({ id: d.id }));
}

export default async function DebateThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const debate = debates.find((d) => d.id === id);
  if (!debate) notFound();
  return (
    <div className="mx-auto w-full max-w-7xl px-0">
      <ThreadView debate={debate} />
    </div>
  );
}
