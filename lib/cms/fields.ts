import {richText} from '../editor/lexical.ts'
import type {LocalizedDocument, LocalizedValue} from './types'

export type Fields = Record<string, unknown>
export const cmsLocales = ['en', 'ar', 'fr'] as const
export const object = (value: unknown): Fields => value && typeof value === 'object' ? value as Fields : {}
export const localizedText = (value: unknown): LocalizedValue => Object.fromEntries(
  cmsLocales.map(locale => [locale, String(object(value)[locale] ?? '')]),
) as LocalizedValue
export const localizedDocument = (value: unknown): LocalizedDocument => Object.fromEntries(
  cmsLocales.map(locale => [locale, richText(object(value)[locale], undefined, locale)]),
) as LocalizedDocument
export function mediaURL(value: unknown, origin: string, mediaRefs?: ReadonlyMap<number, Fields>): string {
  const url = object(typeof value === 'number' ? mediaRefs?.get(value) : value).url
  return url ? new URL(String(url), origin).href : ''
}
