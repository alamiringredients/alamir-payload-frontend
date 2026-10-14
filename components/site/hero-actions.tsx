import type { ReactNode } from "react";
import { SmartLink } from "./smart-link";

type HeroAction = {
  href: string;
  label: ReactNode;
  variant?: "primary" | "secondary";
};

export function HeroActions({ actions }: { actions: HeroAction[] }) {
  return (
    <div className="hero-ctas">
      {actions.map((action) => (
        <SmartLink
          className={`hero-btn ${action.variant === "secondary" ? "ghost" : "primary"}`}
          href={action.href}
          key={action.href}
        >
          {action.label}
        </SmartLink>
      ))}
    </div>
  );
}
