import {SectionCopy,type SectionContentProps} from './section-copy'
export function ProcessSection({section,locale}:SectionContentProps){return (<section className="process" id="process">
  <div className="wrap">
    <div className="process-title reveal">
      <div className="kicker">{section.text.kicker?.[locale] ?? ''}</div>
      <h2><SectionCopy section={section} locale={locale} field="heading"/></h2>
      <p><SectionCopy section={section} locale={locale} field="body"/></p>
    </div>
    <div className="process-steps reveal">
      <article className="step"><span aria-hidden="true"/><h3><SectionCopy section={section} locale={locale} field="heading2"/></h3><p><SectionCopy section={section} locale={locale} field="body2"/></p></article>
      <article className="step"><span aria-hidden="true"/><h3><SectionCopy section={section} locale={locale} field="heading3"/></h3><p><SectionCopy section={section} locale={locale} field="body3"/></p></article>
      <article className="step"><span aria-hidden="true"/><h3><SectionCopy section={section} locale={locale} field="heading4"/></h3><p><SectionCopy section={section} locale={locale} field="body4"/></p></article>
      <article className="step"><span aria-hidden="true"/><h3><SectionCopy section={section} locale={locale} field="heading5"/></h3><p><SectionCopy section={section} locale={locale} field="body5"/></p></article>
    </div>
  </div>
</section>
)}
