import { getForms, getFormCountries, type FormScope } from "@/lib/forms/server";
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const locale = params.get("locale");
  if (locale !== "en" && locale !== "ar" && locale !== "fr")
    return Response.json({ error: "Invalid locale" }, { status: 400 });
  const purpose = params.get('purpose');
  let scope: FormScope | undefined;
  if (purpose) {
    const collection = params.get('collection');
    const ownerId = params.has('ownerId') ? Number(params.get('ownerId')) : undefined;
    const slug = params.get('slug') || undefined;
    if (!((purpose === 'quote' && collection === 'products') || (purpose === 'application' && collection === 'jobs') || (purpose === 'reservation' && collection === 'events') || (collection==='pages' && ['home','contact','quote','application','reservation','search'].includes(purpose))) || (!slug && (!ownerId || !Number.isSafeInteger(ownerId) || ownerId < 1)))
      return Response.json({ error: 'Invalid form owner' }, { status: 400 });
    scope = { purpose, collection, ownerId, slug } as FormScope;
  }
  const forms=await getForms(locale,scope);
  return Response.json({forms,countries:getFormCountries(forms,locale)});
}
