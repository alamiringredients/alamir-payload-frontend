'use client'
import {useEffect,useState,type ReactNode} from 'react'
type NewsCategory = {id:number;slug:string;name:string}

export function NewsTabs({categories,label,panels}: {
  categories: NewsCategory[]
  label: string
  panels: ReactNode[]
}) {
  const [selected,setSelected] = useState(categories[0]?.id)
  const active = categories.some(category=>category.id===selected) ? selected : categories[0]?.id

  useEffect(()=>{
    const selectHashCategory = ()=>{
      const category = categories.find(category=>category.slug===location.hash.slice(1))
      if(category)setSelected(category.id)
    }
    selectHashCategory()
    window.addEventListener('hashchange',selectHashCategory)
    return ()=>window.removeEventListener('hashchange',selectHashCategory)
  },[categories])

  return <>
    <div className="tab-rail" role="tablist" aria-label={label}>
      {categories.map((category,index)=><button
        className="tab"
        type="button"
        role="tab"
        id={`tab-${category.id}`}
        aria-controls={`panel-${category.id}`}
        aria-selected={active===category.id}
        tabIndex={active===category.id?0:-1}
        key={category.id}
        onClick={()=>setSelected(category.id)}
        onKeyDown={event=>{
          const rtl=event.currentTarget.closest('[dir=rtl]') || document.documentElement.dir==='rtl'
          const delta=event.key==='ArrowRight' ? (rtl?-1:1) : event.key==='ArrowLeft' ? (rtl?1:-1) : 0
          if(!delta && event.key!=='Home' && event.key!=='End')return
          event.preventDefault()
          const next=event.key==='Home' ? 0 : event.key==='End' ? categories.length-1 : (index+delta+categories.length)%categories.length
          const nextID=categories[next].id
          setSelected(nextID)
          document.getElementById(`tab-${nextID}`)?.focus()
        }}
      >{category.name}</button>)}
    </div>
    {categories.map((category,index)=><div
      className="tab-panel"
      role="tabpanel"
      id={`panel-${category.id}`}
      aria-labelledby={`tab-${category.id}`}
      hidden={active!==category.id}
      key={category.id}
    >{panels[index]}</div>)}
  </>
}
export function ShareLinks({labels}:{labels:Record<string,string>}){
  const [copied,setCopied]=useState(false),[url,setUrl]=useState('')
  useEffect(()=>setUrl(location.href),[])
  return <div className="share"><a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" aria-label={labels.shareX}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 3h3l-6.6 7.5L21.7 21h-6l-4.7-6.1L5.6 21h-3l7-8L2.6 3h6.1l4.3 5.6L17.5 3Zm-1 16h1.7L7.6 4.8H5.8L16.5 19Z"/></svg></a><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" aria-label={labels.shareLinkedIn}><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-.95 1.82-1.95 3.75-1.95C21.4 8.75 22 11.1 22 14.1V21h-4v-6.1c0-1.45-.03-3.3-2-3.3-2 0-2.3 1.57-2.3 3.2V21h-4V9Z"/></svg></a><button type="button" aria-label={copied?labels.copied:labels.copy} onClick={async()=>{try{await navigator.clipboard.writeText(location.href);setCopied(true)}catch{setCopied(false)}}}>{copied?'✓':<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.1"/></svg>}</button></div>
}
