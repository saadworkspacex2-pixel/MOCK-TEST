import { db } from "@/db";
import { media } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSettings } from "@/lib/settings";

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (ch) =>
    ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : ch === "&" ? "&amp;" : ch === '"' ? "&quot;" : "&apos;",
  );
}

function svgFavicon(text: string, bg: string, fg: string): string {
  const label = escapeXml((text || "L").slice(0, 3));
  const size = label.length >= 3 ? 40 : label.length === 2 ? 50 : 60;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="22" fill="${escapeXml(bg)}"/>
  <text x="50" y="50" text-anchor="middle" dominant-baseline="central"
    font-family="Manrope, 'Hind Siliguri', Arial, sans-serif" font-weight="800"
    font-size="${size}" fill="${escapeXml(fg)}">${label}</text>
</svg>`;
}

export async function GET() {
  const s = await getSettings();

  // Uploaded favicon wins.
  if (s.favicon_url) {
    const match = s.favicon_url.match(/\/api\/media\/(\d+)/);
    if (match) {
      const [row] = await db
        .select()
        .from(media)
        .where(eq(media.id, Number(match[1])));
      if (row) {
        const buf = Buffer.from(row.data, "base64");
        return new Response(new Uint8Array(buf), {
          headers: {
            "Content-Type": row.mime,
            "Cache-Control": "public, max-age=60",
          },
        });
      }
    }
  }

  // Otherwise generate a favicon from the configured text + colours.
  const svg = svgFavicon(
    s.favicon_text ?? "L",
    s.favicon_bg || "#E51A24",
    s.favicon_color || "#FFFFFF",
  );
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=60",
    },
  });
}
