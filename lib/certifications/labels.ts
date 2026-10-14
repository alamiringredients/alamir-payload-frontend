import type {CertificationHolder,CertificationInterfaceLabels,CertificationStatus} from './types'

export const statusLabel = (status: CertificationStatus, labels: CertificationInterfaceLabels) => labels.statuses[status]
export const holderLabel = (holder: CertificationHolder, labels: CertificationInterfaceLabels) => labels[holder === 'group' ? 'group' : 'facility']
