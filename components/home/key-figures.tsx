import {AnimatedFigures, FigureValue} from './animated-figures'
import {ContentImage} from '@/components/site/content-image'
import {SmartLink} from '@/components/site/smart-link'
import type {CmsLocale} from '@/lib/cms/types'
import type {HomeSection} from '@/lib/cms/home-section'

export function KeyFigures({section,locale,groupLogo}:{section:HomeSection;locale:CmsLocale;groupLogo:string}){
  if(!section.figures?.length)return null
  return (<section className="numbers" aria-label={section.text.ariaLabel[locale]}>
  <div className="wrap numbers-inner">
    <div className="numbers-bar reveal">
      <span className="k">{section.text.label[locale]}</span>
      <SmartLink className="group-link" href="https://www.alamireg.com/" target="_blank" rel="noopener">
        {groupLogo&&<ContentImage src={groupLogo} alt="" loading="lazy" decoding="async" />}
        <span>{section.text.viewGroup[locale]}</span>
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
