// Builds runtime theme CSS from admin-managed settings.
export function buildThemeCss(s: Record<string, string>): string {
  const dark = s.dark_mode === "1";
  const red = s.color_primary || "#E51A24";
  const bg = s.color_bg || (dark ? "#111214" : "#F8F9FA");
  const surface = s.color_surface || (dark ? "#1A1A1A" : "#FFFFFF");
  const ink = s.color_text || (dark ? "#F8F9FA" : "#1A1A1A");
  const muted = s.color_muted || (dark ? "#ADB5BD" : "#6C757D");
  const border = s.color_border || (dark ? "rgba(255,255,255,.12)" : "rgba(26,26,26,.09)");

  const fontFace = (name: string, url: string) =>
    url
      ? `@font-face{font-family:'${name}';src:url('${url}');font-display:swap;}`
      : "";

  const bodyFamily = s.font_body_family || "";
  const headingFamily = s.font_heading_family || "";
  const accentFamily = s.font_accent_family || "";
  const styleFamily = s.font_style_family || "";

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
    ? `body,p,span,input,textarea,select,button{font-family:'${bodyFamily}','LHBDCustomBody','Hind Siliguri',sans-serif${s.body_weight ? `;font-weight:${s.body_weight}` : ""}${s.body_line_height ? `;line-height:${s.body_line_height}` : ""}${s.body_letter_spacing ? `;letter-spacing:${s.body_letter_spacing}` : ""};}`
    : ""
}
${
  headingFamily
    ? `h1,h2,h3{font-family:'${headingFamily}','LHBDCustomHeading','Hind Siliguri',sans-serif!important${s.heading_weight ? `;font-weight:${s.heading_weight}` : ""}${s.heading_line_height ? `;line-height:${s.heading_line_height}` : ""}${s.heading_letter_spacing ? `;letter-spacing:${s.heading_letter_spacing}` : ""};}`
    : ""
}
${
  accentFamily
    ? `.btn-red,.text-\\[\\#E51A24\\]{font-family:'${accentFamily}','LHBDCustomAccent',sans-serif${s.accent_weight ? `;font-weight:${s.accent_weight}` : ""}${s.accent_letter_spacing ? `;letter-spacing:${s.accent_letter_spacing}` : ""};}`
    : ""
}
${
  styleFamily
    ? `blockquote,em,.font-style-custom{font-family:'${styleFamily}','LHBDCustomStyle',serif;font-style:italic;}`
    : ""
}
`;
}
