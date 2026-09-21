import { getRealFeed } from "@/server/statsbomb";

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params;
    const feed = await getRealFeed(key);
    return Response.json(feed, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  } catch (err) {
    console.error("feed error:", err);
    return Response.json({ message: "Real feed unavailable right now" }, { status: 502 });
  }
}
