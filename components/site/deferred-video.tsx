"use client";

import { useEffect, useRef, useState, type VideoHTMLAttributes } from "react";

export function DeferredVideo({
  src,
  poster,
  autoPlay,
  onClick,
  ...props
}: VideoHTMLAttributes<HTMLVideoElement>) {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
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
  }, []);

  return (
    <video
      {...props}
      ref={ref}
      src={active ? src : undefined}
      poster={active ? poster : undefined}
      autoPlay={active && autoPlay}
      preload="none"
      onClick={(event) => {
        onClick?.(event);
        const video = event.currentTarget;
        if (event.defaultPrevented || !props.controls || !video.paused || video.currentTime !== 0) return;
        if (!active && typeof src === 'string') {
          video.src = src;
          setActive(true);
        }
        void video.play().catch(() => {});
      }}
    />
  );
}
