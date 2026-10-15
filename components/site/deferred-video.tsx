"use client";

import { flushSync } from "react-dom";
import { useEffect, useRef, useState, type VideoHTMLAttributes } from "react";

export function DeferredVideo({
  src,
  poster,
  autoPlay,
  onClick,
  onKeyDown,
  ...props
}: VideoHTMLAttributes<HTMLVideoElement>) {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || !autoPlay) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setActive(true);
        observer.disconnect();
      },
      { threshold: 0.5 },
    );
    observer.observe(video);
    return () => {
      observer.disconnect();
    };
  }, [autoPlay]);

  return (
    <video
      {...props}
      ref={ref}
      src={active ? src : undefined}
      poster={poster}
      autoPlay={active && autoPlay}
      preload="none"
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || active || !props.controls || !['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        flushSync(() => setActive(true));
        void event.currentTarget.play().catch(() => {});
      }}
      onClick={(event) => {
        onClick?.(event);
        const video = event.currentTarget;
        if (event.defaultPrevented || !props.controls || !video.paused || video.currentTime !== 0) return;
        if (!active) flushSync(() => setActive(true));
        void video.play().catch(() => {});
      }}
    />
  );
}
