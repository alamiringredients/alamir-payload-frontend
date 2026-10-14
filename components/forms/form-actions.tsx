import type { CSSProperties, ReactNode } from "react";

export function FormActions({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`form-actions${className ? ` ${className}` : ""}`}
      style={style}
    >
      {children}
    </div>
  );
}
