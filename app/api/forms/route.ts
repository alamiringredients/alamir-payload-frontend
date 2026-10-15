import {parseFormScope} from '@/lib/forms/ownership';
import { getForms, getFormCountries } from "@/lib/forms/server";
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const locale = params.get("locale");
  if (locale !== "en" && locale !== "ar" && locale !== "fr")
    return Response.json({ error: "Invalid locale" }, { status: 400 });
  const scope = parseFormScope(params);
  if (scope === null) return Response.json({error: 'Invalid form owner'}, {status: 400});
  const forms=await getForms(locale,scope);
  return Response.json({forms,countries:await getFormCountries(forms,locale)});
}
