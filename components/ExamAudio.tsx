"use client";

import { useRef } from "react";

// Official-style audio: forward seeking and playback-rate changes are blocked.
export default function ExamAudio({ src }: { src: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const furthest = useRef(0);

  return (
    <div>
      <audio
        ref={audio}
        controls
        preload="metadata"
        src={src}
        controlsList="nodownload noplaybackrate"
        onContextMenu={(event) => event.preventDefault()}
        onRateChange={() => {
          if (audio.current) audio.current.playbackRate = 1;
        }}
        onTimeUpdate={() => {
          const el = audio.current;
          if (!el) return;
          if (el.currentTime > furthest.current + 0.8) {
            el.currentTime = furthest.current;
          } else {
            furthest.current = Math.max(furthest.current, el.currentTime);
          }
        }}
        onSeeking={() => {
          const el = audio.current;
          if (el && el.currentTime > furthest.current + 0.8) {
            el.currentTime = furthest.current;
          }
        }}
        className="w-full"
      />
      <p className="mt-2 text-[11px] text-stone-500">
        অডিও এগিয়ে নেওয়া বা playback speed বদলানো যাবে না। শোনা অংশ আবার শুনতে পারবেন।
      </p>
    </div>
  );
}
