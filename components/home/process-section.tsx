import {SectionCopy,type SectionContentProps} from '@/components/editor/section-copy'
export function ProcessSection({section,locale}:SectionContentProps){return (<section className="process" id="process">
  <div className="wrap">
    <div className="process-title reveal">
      <div className="kicker">{section.texts[0]?.values[locale] ?? ''}</div>
      <h2><SectionCopy section={section} locale={locale} richIndex={0}/></h2>
      <p><SectionCopy section={section} locale={locale} richIndex={1}/></p>
    </div>
    <div className="process-steps reveal">
      <article className="step"><span aria-hidden="true"/><h3><SectionCopy section={section} locale={locale} richIndex={2}/></h3><p><SectionCopy section={section} locale={locale} richIndex={3}/></p></article>
      <article className="step"><span aria-hidden="true"/><h3><SectionCopy section={section} locale={locale} richIndex={4}/></h3><p><SectionCopy section={section} locale={locale} richIndex={5}/></p></article>
      <article className="step"><span aria-hidden="true"/><h3><SectionCopy section={section} locale={locale} richIndex={6}/></h3><p><SectionCopy section={section} locale={locale} richIndex={7}/></p></article>
      <article className="step"><span aria-hidden="true"/><h3><SectionCopy section={section} locale={locale} richIndex={8}/></h3><p><SectionCopy section={section} locale={locale} richIndex={9}/></p></article>
    </div>
  </div>
</section>
)}
