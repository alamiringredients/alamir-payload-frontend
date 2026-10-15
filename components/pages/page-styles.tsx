import 'server-only'
import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {createHash} from 'node:crypto'

const files:Record<string,string[]>={
 home:['home'],
 quality:['quality'],
 products:['products'],downloads:['downloads'],events:['events'],'book-a-meeting':['book-a-meeting'],
 news:['news'],sustainability:['sustainability'],contact:['contact'],
 privacy:['document'],terms:['document'],cookies:['document'],'thank-you':['document'],'404':['document'],search:['document'],
}
const styles=new Map<string,{css:string;href:string}>()
export function PageStyles({page}:{page:string}){
 return (files[page]??[]).map(name=>{
  let style=styles.get(name)
  if(!style||process.env.NODE_ENV==='development'){
   const css=readFileSync(join(process.cwd(),name==='home'?'styles/home.css':`styles/pages/${name}.css`),'utf8')
   style={css,href:`cms-${name}-${createHash('sha256').update(css).digest('hex').slice(0,12)}`}
   styles.set(name,style)
  }
  return <style key={style.href} href={style.href} precedence="cms">{style.css}</style>
 })
}
