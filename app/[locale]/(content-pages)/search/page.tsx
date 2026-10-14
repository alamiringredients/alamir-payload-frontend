import {WebsitePage,websitePageMetadata} from '@/components/pages/website-page'

type Props={params:Promise<{locale:string}>;searchParams:Promise<{q?:string;tag?:string}>}
const pageParams=async(params:Props['params'])=>({...await params,slug:['search']})
export async function generateMetadata(props:Props){return websitePageMetadata({...props,params:pageParams(props.params)})}
export default async function Page(props:Props){
 const input=await props.searchParams
 return <WebsitePage {...props} params={pageParams(props.params)} searchParams={Promise.resolve(input)}/>
}
