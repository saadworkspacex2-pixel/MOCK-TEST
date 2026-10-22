"use client";

import { createContext, useContext, type ReactNode } from "react";

export type BrandingValue = {
  showLogo: boolean;
  logoUrl: string;
  width: number;
  height: number;
  x: number;
  y: number;
  radius: number;
  showText: boolean;
  name: string;
  nameAccent: string;
  nameSize: number;
  tagline: string;
  showTagline: boolean;
};

export const DEFAULT_BRANDING: BrandingValue = {
  showLogo: true,
  logoUrl: "",
  width: 38,
  height: 38,
  x: 0,
  y: 0,
  radius: 10,
  showText: true,
  name: "LHBD",
  nameAccent: ".",
  nameSize: 20,
  tagline: "মক টেস্ট প্ল্যাটফর্ম",
  showTagline: true,
};

const BrandContext = createContext<BrandingValue>(DEFAULT_BRANDING);

export function BrandProvider({
  value,
  children,
}: {
  value: BrandingValue;
  children: ReactNode;
}) {
  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBranding(): BrandingValue {
  return useContext(BrandContext);
}
