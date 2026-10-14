import {AnimatedFigures, FigureValue} from './animated-figures'
import {ContentImage} from '@/components/site/content-image'
import {SmartLink} from '@/components/site/smart-link'
import type {HomeSectionContent,CmsLocale} from '@/lib/cms/types'

export function KeyFigures({section,locale,groupLogo}:{section:HomeSectionContent;locale:CmsLocale;groupLogo:string}){
  const copy=(source:string)=>section.texts.find(field=>field.source===source)?.values[locale]??''
  if(!section.figures?.length)return null
  return (<section className="numbers" aria-label={copy('Key figures')}>
  <div className="wrap numbers-inner">
    <div className="numbers-bar reveal">
      <span className="k">{copy('Al Amir Group — in figures')}</span>
      <SmartLink className="group-link" href="https://www.alamireg.com/" target="_blank" rel="noopener">
        {groupLogo&&<ContentImage src={groupLogo} alt="" loading="lazy" decoding="async" />}
        <span>{copy('View Alamir Group')}</span>
        <span className="arrow" aria-hidden="true" />
      </SmartLink>
    </div>
    <AnimatedFigures>
      {section.figures.map((figure,index)=><li className="number" key={figure.id}>
        <FigureValue index={index+1} value={figure.value} unit={figure.unit}>
          {figure.unitLabel[locale]&&<small>{figure.unitLabel[locale]}</small>}
        </FigureValue>
        <span className="k">{figure.label[locale]}</span>
        {figure.description[locale]&&<span className="sub">{figure.description[locale]}</span>}
      </li>)}
    </AnimatedFigures>
  </div>
</section>
)}
