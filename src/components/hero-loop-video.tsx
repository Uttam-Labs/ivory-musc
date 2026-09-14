"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function HeroLoopVideo({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

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
    <div className={className} aria-hidden="true">
      <Image
        src="/media/ivory-muse-hero-poster.webp"
        alt=""
        fill
        priority
        quality={95}
        sizes="100vw"
        className="object-cover"
      />
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${playing ? "opacity-100" : "opacity-0"}`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        onPlaying={() => setPlaying(true)}
      >
        <source src="/media/ivory-muse-hero.webm" type="video/webm" />
        <source src="/media/ivory-muse-hero.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
