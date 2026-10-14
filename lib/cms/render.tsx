import {SiteIcon} from '@/components/site/site-icon'
import {EmbeddedVideo} from '@/components/editor/embedded-video'
import {Children, cloneElement, isValidElement, type ComponentProps, type ReactElement, type ReactNode} from 'react'
import type {HomeSectionContent, ManagedPageContent, WebsiteSettings} from './types'
import type {SiteLocale} from '@/i18n/navigation'
import {InlineContent} from '@/components/editor/inline-content'
import {SmartLink} from '@/components/site/smart-link'
import {cmsCardHref} from './card-routes'
import {PageHero} from '@/components/site/page-hero'
import {ContentSection, SectionHeading} from '@/components/site/content-section'

const textProps = ['alt', 'aria-label', 'placeholder', 'title', 'label', 'data-validation-required', 'data-validation-email'] as const

function expandContentComponent(element: ReactElement<Record<string, unknown>>): ReactNode {
  if (element.type === PageHero) return PageHero(element.props as ComponentProps<typeof PageHero>)
  if (element.type === ContentSection) return ContentSection(element.props as ComponentProps<typeof ContentSection>)
  if (element.type === SectionHeading) return SectionHeading(element.props as ComponentProps<typeof SectionHeading>)
  return element
}

function normalize(value: string) {
  return value.replaceAll('&gt;', '>').replaceAll('&lt;', '<').replace(/\s+/g, ' ').trim()
}

function withWhitespace(original: string, replacement: string) {
  return `${original.match(/^\s*/)?.[0] ?? ''}${replacement}${original.match(/\s*$/)?.[0] ?? ''}`
}

function hasContent(node: ReactNode): boolean {
  if (typeof node === 'string') return Boolean(node.trim())
  if (typeof node === 'number') return true
  if (Array.isArray(node)) return node.some(hasContent)
  if (!isValidElement(node)) return false
  const props = node.props as Record<string, unknown>
  return Boolean(props.src) || hasContent(props.children as ReactNode)
}

export function renderManagedSection(node: ReactNode, section: HomeSectionContent, locale: SiteLocale, options: {preserveUnknownText?: boolean} = {}): ReactNode {
  const texts = new Map<string,string>()
  for(const field of section.texts){
    const replacement=field.values[locale]??''
    texts.set(normalize(field.source),replacement)
  }
  const assets = new Map(section.assets.map((field) => [field.source, field.value]))
  const links = new Map(section.links.map((field) => [field.source, field.value]))
  const sourceText=(child:ReactNode):string=>typeof child==='string'?child:Array.isArray(child)?child.map(sourceText).join(''):isValidElement(child)?sourceText((child.props as {children?:ReactNode}).children):''

  const visit = (child: ReactNode): ReactNode => {
    if (typeof child === 'string') {
      const symbol = normalize(child)
      if (['->', '→'].includes(symbol)) return <SiteIcon name="arrow-right"/>
      if (['<-', '←'].includes(symbol)) return <SiteIcon name="arrow-left"/>
      if (['×', '✕', '✖'].includes(symbol)) return <SiteIcon name="close"/>
      if (['.', '/', '|', '•', '·', '…', '+', '−', '—', '–', '*'].includes(symbol)) return child
      const replacement = texts.get(normalize(child))
      return replacement !== undefined ? withWhitespace(child, replacement) : (/^\s*$/.test(child) || options.preserveUnknownText ? child : '')
    }
    if (Array.isArray(child)) return child.map(visit)
    if (!isValidElement(child)) return child

    const element = child as ReactElement<Record<string, unknown>>
    const expanded = expandContentComponent(element)
    if (expanded !== element) return visit(expanded)
    const props: Record<string, unknown> = {}
    for (const name of textProps) {
      const value = element.props[name]
      if (typeof value === 'string') props[name] = texts.get(normalize(value)) ?? (options.preserveUnknownText ? value : '')
    }
    // Keep the brand placeholder for renderWebsiteBrand to resolve from Website settings.
    if (typeof element.props.src === 'string' && assets.has(element.props.src)) props.src = assets.get(element.props.src)
    else if (element.props.src === '/assets/logo-full.svg' || element.props.src === '/assets/logo.webp') props.src = element.props.src
    if (typeof element.props.poster === 'string' && assets.has(element.props.poster)) props.poster = assets.get(element.props.poster)
    if (typeof element.props.href === 'string' && links.has(element.props.href)) props.href = links.get(element.props.href)
    if ('data-count' in element.props) {
      const count=texts.get(normalize(sourceText(element.props.children as ReactNode)))
      if(count!==undefined && Number.isFinite(Number(count))) props['data-count']=count
    }
    const rich=typeof element.type==='string'&&/^(h[1-3]|p)$/.test(element.type)?section.richTexts?.find(f=>normalize(f.source)===normalize(sourceText(element.props.children as ReactNode))):undefined
    if (element.props['data-cms-card-list'] && section.cards) {
      props.children=section.cards.map((card,index)=><SmartLink className="card" href={cmsCardHref(card.id)} key={card.id}>
        <div className="no">{String(index+1).padStart(2,'0')}</div>
        <h2>{card.title[locale]}</h2>
        <p>{card.description[locale]}</p>
      </SmartLink>)
    } else if ('children' in element.props) props.children = rich?<InlineContent document={rich.values[locale]}/>:Children.map(element.props.children as ReactNode, visit)
    if (typeof element.props.src === 'string' && !props.src && !options.preserveUnknownText) return null
    if (typeof element.type === 'string' && ['p', 'h1', 'h2', 'h3', 'figure', 'li'].includes(element.type) && !rich && !hasContent(props.children as ReactNode)) return null
    if (element.type === 'iframe') {
      const video = {...element.props, ...props}
      return video.src ? <EmbeddedVideo src={String(video.src)} label={String(video.title ?? '')} ratio="16/9"/> : null
    }
    return cloneElement(element, props)
  }

  return visit(node)
}

export function renderManagedPage(node:ReactNode,content:ManagedPageContent,locale:SiteLocale):ReactNode{
  let sectionIndex=0
  const visit=(child:ReactNode):ReactNode=>{
    if(Array.isArray(child))return child.map(visit)
    if(!isValidElement(child))return child
    const element=child as ReactElement<Record<string,unknown>>
    const expanded=expandContentComponent(element)
    if(expanded!==element)return visit(expanded)
    if(element.type==='section'){
      const section=content.sections[sectionIndex++]
      return section?.enabled?renderManagedSection(element,section,locale,{preserveUnknownText:true}):null
    }
    if(!('children' in element.props))return element
    return cloneElement(element,{children:Children.map(element.props.children as ReactNode,visit)})
  }
  return visit(node)
}

export function renderWebsiteBrand(node: ReactNode, settings: WebsiteSettings, locale: SiteLocale): ReactNode {
  const visit = (child: ReactNode): ReactNode => {
    if (Array.isArray(child)) return child.map(visit)
    if (!isValidElement(child)) return child
    const element = child as ReactElement<Record<string, unknown>>
    const props: Record<string, unknown> = {}
    if (element.props.src === '/assets/logo-full.svg') {if (!settings.logo) return null; props.src = settings.logo}
    if (element.props.src === '/assets/logo.webp') {if (!settings.groupLogo) return null; props.src = settings.groupLogo}
    if (element.props.src === '/assets/icon.svg') {if (!settings.icon) return null; props.src = settings.icon}
    if (typeof element.props.alt === 'string' && element.props.alt.includes('Alamir Ingredients')) props.alt = settings.siteName[locale]
    if ('children' in element.props) props.children = Children.map(element.props.children as ReactNode, visit)
    return cloneElement(element, props)
  }
  return visit(node)
}
