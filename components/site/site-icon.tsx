export function SiteIcon({name}: {name: 'arrow-right' | 'arrow-left' | 'close'}) {
  const path = name === 'close' ? 'm6 6 12 12M6 18 18 6' : name === 'arrow-left' ? 'M20 12H4m6-6-6 6 6 6' : 'M4 12h16m-6-6 6 6-6 6'
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={path}/></svg>
}
