import type { ReactNode } from "react";
import { SmartLink } from "./smart-link";

export type Action = {
  href: string;
  label: ReactNode;
  variant?: "primary" | "secondary";
  dialog?: string;
};

export function SectionHeading({
  kicker,
  title,
  description,
  className = "",
  id,
  reveal = true,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  id?: string;
  reveal?: boolean;
}) {
  return (
    <div
      id={id}
      className={`band-head${className ? ` ${className}` : ""}${reveal ? " reveal" : ""}`}
    >
      {kicker && <div className="kicker">{kicker}</div>}
      <h2>{title}</h2>
      {description && <p className="lead">{description}</p>}
    </div>
  );
}

export function ActionGroup({
  actions,
  className = "",
  reveal = true,
}: {
  actions: Action[];
  className?: string;
  reveal?: boolean;
}) {
  return (
    <div
      className={`form-actions form-actions--section${className ? ` ${className}` : ""}${reveal ? " reveal" : ""}`}
    >
      {actions.map((action) => {
        const className=action.variant === "secondary" ? "btn ghost" : "btn"
        return action.dialog ? <button className={className} type="button" data-product-catalog-open aria-haspopup="dialog" aria-controls={action.dialog} aria-expanded="false" key={action.dialog}>{action.label}</button> : <SmartLink className={className} href={action.href} key={action.href}>{action.label}</SmartLink>
      })}
    </div>
  );
}

export function ContentSection({
  children,
  id,
  theme = "plain",
  className = "",
}: {
  children: ReactNode;
  id?: string;
  theme?: "plain" | "tint" | "deep";
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`band${theme === "plain" ? "" : ` ${theme}`}${className ? ` ${className}` : ""}`}
    >
      <div className="wrap">{children}</div>
    </section>
  );
}

export function CardGrid({children,className='',reveal=true}:{children:ReactNode;className?:string;reveal?:boolean}){
  return <div className={`cards c3${className?` ${className}`:''}${reveal?' reveal':''}`}>{children}</div>
}

export function CallToActionSection({kicker,title,description,actions,theme='deep',className=''}:{kicker?:ReactNode;title:ReactNode;description?:ReactNode;actions:Action[];theme?:'plain'|'tint'|'deep';className?:string}){
  return <ContentSection theme={theme} className={className}>
    <SectionHeading kicker={kicker} title={title} description={description}/>
    <ActionGroup actions={actions}/>
  </ContentSection>
}
