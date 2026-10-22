// Builds runtime theme CSS from admin-managed settings.
export function buildThemeCss(s: Record<string, string>): string {
  const red = s.color_primary || "#E51A24";
  const bg = s.color_bg || "#F8F9FA";
  const surface = s.color_surface || "#FFFFFF";
  const ink = s.color_text || "#1A1A1A";
  const muted = s.color_muted || "#6C757D";
  const border = s.color_border || "rgba(26,26,26,.09)";

  const fontFace = (name: string, url: string) =>
    url
      ? `@font-face{font-family:'${name}';src:url('${url}');font-display:swap;}`
      : "";

  const bodyFamily = s.font_body_family || "";
  const headingFamily = s.font_heading_family || "";
  const accentFamily = s.font_accent_family || "";
  const styleFamily = s.font_style_family || "";

  /**
   * Bold / italic switches. When a switch is turned on we force the weight (or
   * italic) so it overrides Tailwind utility classes; when it is turned off we
   * explicitly reset to normal so bold text becomes regular.
   * "unset" (the default) leaves the site's own styling untouched.
   */
  const weight = (slot: string, fallback?: string) => {
    const mode = s[`${slot}_bold`];
    if (mode === "on") return "font-weight:700!important;";
    if (mode === "off") return "font-weight:400!important;";
    return fallback ? `font-weight:${fallback};` : "";
  };
  const italic = (slot: string, fallback?: string) => {
    const mode = s[`${slot}_italic`];
    if (mode === "on") return "font-style:italic!important;";
    if (mode === "off") return "font-style:normal!important;";
    return fallback ? `font-style:${fallback};` : "";
  };
  const boldMode = (slot: string) => s[`${slot}_bold`] ?? "unset";

  return `
${fontFace("LHBDCustomBody", s.font_body_url || "")}
${fontFace("LHBDCustomHeading", s.font_heading_url || "")}
${fontFace("LHBDCustomAccent", s.font_accent_url || "")}
${fontFace("LHBDCustomStyle", s.font_style_url || "")}
:root{
  --lhbd-red:${red};
  --lhbd-red-dark:${red};
  --lhbd-bg:${bg};
  --lhbd-surface:${surface};
  --lhbd-ink:${ink};
  --lhbd-muted:${muted};
  --lhbd-border:${border};
}
body{background:${s.color_gradient || bg}!important;color:${ink}!important;}
.bg-\\[\\#F8F9FA\\]{background-color:${bg}!important;}
.card,.glass,.bg-white{background-color:${surface}!important;border-color:${border}!important;}
.text-\\[\\#1A1A1A\\]{color:${ink}!important;}
.text-\\[\\#6C757D\\]{color:${muted}!important;}
.text-\\[\\#E51A24\\]{color:${red}!important;}
.bg-\\[\\#E51A24\\]{background-color:${red}!important;}
.btn-red{background:${red}!important;}
${
  bodyFamily
    ? `body,p,span,input,textarea,select,button{font-family:'${bodyFamily}','LHBDCustomBody','Hind Siliguri',sans-serif;${s.body_weight ? `font-weight:${s.body_weight};` : ""}${s.body_line_height ? `line-height:${s.body_line_height};` : ""}${s.body_letter_spacing ? `letter-spacing:${s.body_letter_spacing};` : ""}}`
    : ""
}
${
  headingFamily
    ? `h1,h2,h3{font-family:'${headingFamily}','LHBDCustomHeading','Hind Siliguri',sans-serif!important;${s.heading_weight ? `font-weight:${s.heading_weight};` : ""}${s.heading_line_height ? `line-height:${s.heading_line_height};` : ""}${s.heading_letter_spacing ? `letter-spacing:${s.heading_letter_spacing};` : ""}}`
    : ""
}
${
  accentFamily
    ? `.btn-red,.text-\\[\\#E51A24\\]{font-family:'${accentFamily}','LHBDCustomAccent',sans-serif;${s.accent_weight ? `font-weight:${s.accent_weight};` : ""}${s.accent_letter_spacing ? `letter-spacing:${s.accent_letter_spacing};` : ""}}`
    : ""
}
${
  styleFamily
    ? `blockquote,em,.font-style-custom{font-family:'${styleFamily}','LHBDCustomStyle',serif;}`
    : ""
}
/* ---- Bold / italic switches (override utilities when set) ---- */
body,p,span,input,textarea,select,button,label,li,td,th{${weight("body")}${italic("body")}}
h1,h2,h3,h4,h5,h6{${weight("heading")}${italic("heading")}}
.btn-red,.btn-ink,.btn-ghost,.badge-soft,.badge-live,.badge-neutral{${weight("accent")}${italic("accent")}}
blockquote,em,.font-style-custom{${weight("style")}${italic("style")}}
${
  boldMode("body") === "off"
    ? `strong,b{font-weight:400!important;}`
    : boldMode("body") === "on"
      ? `strong,b{font-weight:700!important;}`
      : ""
}
`;
}
