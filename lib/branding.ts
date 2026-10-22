export type BrandConfig = {
  logoUrl: string;
  faviconUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  objectFit: "contain" | "cover" | "fill";
  showText: boolean;
};

export function brandOf(s: Record<string, string>): BrandConfig {
  const objectFit = ["contain", "cover", "fill"].includes(s.logo_object_fit)
    ? (s.logo_object_fit as BrandConfig["objectFit"])
    : "contain";
  return {
    logoUrl: s.logo_url || "",
    faviconUrl: s.favicon_url || "",
    x: Number(s.logo_x || 0),
    y: Number(s.logo_y || 0),
    width: Math.max(20, Math.min(500, Number(s.logo_width || 44))),
    height: Math.max(20, Math.min(300, Number(s.logo_height || 44))),
    objectFit,
    showText: s.logo_show_text !== "0",
  };
}
