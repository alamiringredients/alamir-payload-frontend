const cmsCardRoutes = [
  {id:'card-products',href:'/products'},
  {id:'card-quality',href:'/quality'},
  {id:'card-downloads',href:'/downloads'},
  {id:'card-careers',href:'/careers'},
  {id:'card-news',href:'/news'},
  {id:'card-contact',href:'/contact'},
] as const

export function cmsCardHref(id:string){
  const route=cmsCardRoutes.find(route=>route.id===id)
  if(!route)throw new Error(`Unknown CMS card route: ${id}`)
  return route.href
}
