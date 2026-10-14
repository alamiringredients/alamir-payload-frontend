import {revalidateTag} from 'next/cache'
export async function POST(request:Request){
 if(!process.env.CMS_REVALIDATION_SECRET || request.headers.get('authorization')!==`Bearer ${process.env.CMS_REVALIDATION_SECRET}`)return new Response(null,{status:401})
 revalidateTag('payload-content',{expire:0})
 return Response.json({revalidated:true})
}
