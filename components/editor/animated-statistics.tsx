"use client";

import { useEffect, useRef } from "react";

type StatisticItem = {
  value: string;
  label: string;
};

type ParsedValue = {
  count: number | null;
  decimals: number;
  number: string;
  unit: string;
  qualifier: string;
};

const COUNT_DURATION = 1400;
const COUNT_STAGGER = 110;

function parseValue(value: string): ParsedValue {
  const match = value.trim().match(/^(\d+(?:[.,]\d+)?)([^\d]*)$/u);
  if (!match) {
    return {
      count: null,
      decimals: 0,
      number: value,
      unit: "",
      qualifier: "",
    };
  }

  const numericText = match[1];
  const suffix = match[2];
  const suffixMatch = suffix.match(/^([^\p{L}]*)(.*)$/u);

  return {
    count: Number(numericText.replace(",", ".")),
    decimals: numericText.split(/[.,]/u)[1]?.length ?? 0,
    number: numericText,
    unit: suffixMatch?.[1] ?? "",
    qualifier: suffixMatch?.[2] ?? "",
  };
}

function formatCount(value: number, decimals: number) {
  return decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
}

export function AnimatedStatistics({ items }: { items: StatisticItem[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;

    const counters = Array.from(
      root.querySelectorAll<HTMLElement>("[data-stat-count]"),
    );
    if (!counters.length) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    let generation = 0;
    const frames = new Set<number>();
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const stop = () => {
      generation += 1;
      frames.forEach((frame) => cancelAnimationFrame(frame));
      timers.forEach((timer) => clearTimeout(timer));
      frames.clear();
      timers.clear();
    };

    const reset = () => {
      counters.forEach((counter) => {
        counter.textContent = formatCount(
          Number(counter.dataset.statFrom ?? 0),
          Number(counter.dataset.statDecimals ?? 0),
        );
      });
    };

    const play = () => {
      stop();
      reset();
      const currentGeneration = generation;

      counters.forEach((counter, index) => {
        const timer = setTimeout(() => {
          timers.delete(timer);
          const from = Number(counter.dataset.statFrom ?? 0);
          const target = Number(counter.dataset.statCount ?? 0);
          const decimals = Number(counter.dataset.statDecimals ?? 0);
          let startedAt: number | null = null;

          const step = (now: number) => {
            if (currentGeneration !== generation) return;
            startedAt ??= now;
            const progress = Math.min(1, (now - startedAt) / COUNT_DURATION);
            const eased = 1 - Math.pow(1 - progress, 4);
            counter.textContent = formatCount(
              from + (target - from) * eased,
              decimals,
            );

            if (progress < 1) {
              const frame = requestAnimationFrame(step);
              frames.add(frame);
            }
          };

          const frame = requestAnimationFrame(step);
          frames.add(frame);
        }, index * COUNT_STAGGER);
        timers.add(timer);
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) play();
        else {
          stop();
          reset();
        }
      },
      { threshold: 0.35, rootMargin: "0px 0px -12% 0px" },
    );

    observer.observe(root);
    return () => {
      observer.disconnect();
      stop();
    };
  }, [items]);

  return (
    <div ref={rootRef} data-statistics-grid="">
      {items.map((item) => {
        const value = parseValue(item.value);
        return (
          <div key={`${item.value}-${item.label}`}>
            <strong aria-label={item.value}>
              <span
                aria-hidden="true"
                data-stat-count={value.count ?? undefined}
                data-stat-decimals={value.decimals || undefined}
              >
                {value.number}
              </span>
              {value.unit ? <span data-stat-unit="">{value.unit}</span> : null}
              {value.qualifier ? (
                <small>{value.qualifier}</small>
              ) : null}
            </strong>
            <p>{item.label}</p>
          </div>
        );
      })}
    </div>
  );
}
