"use client";

import { useEffect, useRef } from "react";

export function HeroLoopVideo({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      if (document.visibilityState === "visible" && video.paused) {
        void video.play().catch(() => undefined);
      }
    };
    const handleVisibility = () => play();
    const handleEnded = () => {
      video.currentTime = 0;
      play();
    };

    play();
    video.addEventListener("canplay", play);
    video.addEventListener("loadeddata", play);
    video.addEventListener("pause", play);
    video.addEventListener("ended", handleEnded);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", play);
    window.addEventListener("pageshow", play);
    window.addEventListener("pointerdown", play, { passive: true });
    window.addEventListener("touchstart", play, { passive: true });

    return () => {
      video.removeEventListener("canplay", play);
      video.removeEventListener("loadeddata", play);
      video.removeEventListener("pause", play);
      video.removeEventListener("ended", handleEnded);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", play);
      window.removeEventListener("pageshow", play);
      window.removeEventListener("pointerdown", play);
      window.removeEventListener("touchstart", play);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/media/ivory-muse-hero-poster.webp"
      controls={false}
      disablePictureInPicture
      aria-hidden="true"
    >
      <source src="/media/ivory-muse-hero.webm" type="video/webm" />
      <source src="/media/ivory-muse-hero.mp4" type="video/mp4" />
    </video>
  );
}
