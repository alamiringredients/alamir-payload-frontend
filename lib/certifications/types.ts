import type {LocalizedValue} from '@/lib/cms/types'

export type CertificationHolder = 'group' | 'sadat-city'
export type CertificationStatus = 'planned' | 'in-progress' | 'held' | 'suspended' | 'expired'
export type CertificationTypeContent = {
  name: LocalizedValue
  description: LocalizedValue
  logo: string
  badge: string
  kind: 'certification' | 'registration' | 'membership' | 'audit'
}
export type CertificationContent = {
  scope: LocalizedValue
  target_date: string
  issue_date: string
  expiry_date: string
  certificate_number: string
  document: string
}
export type CertificationType = {id: number; slug: string; content: CertificationTypeContent}
export type Certification = {
  id: number
  type_id: number
  holder: CertificationHolder
  status: CertificationStatus
  published: boolean
  sort_order: number
  content: CertificationContent
}
export type CertificationData = {types: CertificationType[]; certifications: Certification[]}
export type CertificationEntry = Certification & {type: CertificationType}
export type CertificationInterfaceLabels = {
  heldToday:string;programme:string;group:string;facility:string;entries:string;target:string;unconfirmed:string;issued:string;expires:string;download:string;downloads:string;marks:string;pdf:string
  statuses:Record<CertificationStatus,string>
}
export function effectiveStatus(record: Certification, today = new Date().toISOString().slice(0, 10)): CertificationStatus {
  return record.status === 'held' && record.content.expiry_date && record.content.expiry_date < today ? 'expired' : record.status
}
export function certificationEntries(data: CertificationData, holder?: CertificationHolder): CertificationEntry[] {
  return data.certifications.flatMap(record => {
    const type = data.types.find(type => type.id === record.type_id)
    return type && record.published && (!holder || record.holder === holder) ? [{...record, type}] : []
  }).sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
}
export function downloadableCertifications(data: CertificationData, holder?: CertificationHolder, today?: string) {
  return certificationEntries(data, holder).filter(record => effectiveStatus(record, today) === 'held' && record.content.document)
}
