"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";

function embedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&loop=1&playlist=${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1&muted=1&loop=1&background=1`;
  return null;
}

export default function MediaHero({
  headline,
  subtext,
  images,
  videoUrl,
  ctaLabel,
  ctaUrl,
}: {
  headline: string;
  subtext: string;
  images: string[];
  videoUrl: string;
  ctaLabel: string;
  ctaUrl: string;
}) {
  const [index, setIndex] = useState(0);
  const embed = videoUrl ? embedUrl(videoUrl) : null;
  const isMp4 = videoUrl && !embed && /\.(mp4|webm|mov)(\?|$)/i.test(videoUrl);

  useEffect(() => {
    if (images.length < 2 || videoUrl) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), 4500);
    return () => clearInterval(t);
  }, [images.length, videoUrl]);

  return (
    <section className="relative overflow-hidden bg-[#1A1A1A] text-white">
      <div className="absolute inset-0">
        {embed ? (
          <iframe
            src={embed}
            className="h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            title="hero video"
          />
        ) : isMp4 ? (
          <video
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover opacity-60"
          />
        ) : images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[index]}
            alt=""
            className="anim-fade-in h-full w-full object-cover opacity-60"
            key={images[index]}
          />
        ) : null}
      </div>
      <div className="relative mx-auto max-w-5xl px-5 py-24 text-center sm:px-8">
        <h2 className="text-3xl font-bold sm:text-5xl">{headline}</h2>
        {subtext && <p className="mx-auto mt-4 max-w-2xl text-white/70">{subtext}</p>}
        {ctaLabel && ctaUrl && (
          <a
            href={ctaUrl}
            className="btn-red mt-8 inline-flex items-center gap-2 rounded-md px-7 py-3.5 font-bold"
          >
            {ctaLabel} <Icon name="arrow" size={16} />
          </a>
        )}
        {images.length > 1 && !videoUrl && (
          <div className="mt-8 flex justify-center gap-2">
            {images.map((img, i) => (
              <button
                key={img + i}
                aria-label={`slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 w-8 rounded-full ${i === index ? "bg-white" : "bg-white/30"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
