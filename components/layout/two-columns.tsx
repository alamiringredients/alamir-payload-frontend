import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from "react";
import styles from "./two-columns.module.css";

export const columnWidths: Record<string, string> = {
  "50-50": "minmax(0,1fr) minmax(0,1fr)",
  "55-45": "minmax(0,1fr) minmax(0,.82fr)",
  "60-40": "minmax(0,3fr) minmax(0,2fr)",
  "70-30": "minmax(0,7fr) minmax(0,3fr)",
  "40-60": "minmax(0,2fr) minmax(0,3fr)",
  "30-70": "minmax(0,3fr) minmax(0,7fr)",
};
export function TwoColumns({
  as: Tag = "div",
  columns = "minmax(0,1fr) minmax(0,1fr)",
  align = "stretch",
  gap = "clamp(36px,5vw,72px)",
  collapseAt = 900,
  reverse = false,
  className = "",
  style,
  children,
  ref,
  ...props
}: Omit<HTMLAttributes<HTMLElement>, "children"> & {
  as?: "div" | "section" | "figure" | "header";
  collapseAt?: 700 | 900 | 1050;
  reverse?: boolean;
  columns?: string;
  align?: "start" | "center" | "end" | "stretch";
  gap?: string;
  children: ReactNode;
  ref?: Ref<HTMLElement>;
}) {
  return (
    <Tag
      {...props}
      ref={ref as never}
      data-two-columns=""
      data-collapse-at={collapseAt}
      data-reverse={reverse}
      className={`${styles.columns} ${className}`}
      style={
        {
          "--two-column-widths": columnWidths[columns] ?? columns,
          "--two-column-gap": gap,
          alignItems: align,
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
