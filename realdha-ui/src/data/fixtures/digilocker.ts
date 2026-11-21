import type { JourneyRole } from '../../app/journeys'

/** Documents a DigiLocker account can share, per persona. Sample data: issuers are real departments, numbers are not. */
export interface IssuedDoc {
  id: string
  name: string
  issuer: string
  /** DigiLocker document URI (sample). */
  uri: string
  /** Why Realdha asks for it. */
  why: string
  /** Pre-ticked on the consent step. */
  required?: boolean
}

const AADHAAR: IssuedDoc = { id: 'aadhaar', name: 'Aadhaar card', issuer: 'UIDAI', uri: 'in.gov.uidai-ADHAR-XXXXXXXX4821', why: 'Name and address match for KYC', required: true }
const PAN: IssuedDoc = { id: 'pan', name: 'PAN verification record', issuer: 'Income Tax Department', uri: 'in.gov.pan-PANCR-ABCDE1234F', why: 'Matches the PAN you entered', required: true }

export const DIGILOCKER_DOCS: Record<JourneyRole, IssuedDoc[]> = {
  owner: [
    AADHAAR,
    PAN,
    { id: '7_12', name: '7/12 extract (Satbara)', issuer: 'Revenue Department, Maharashtra', uri: 'in.gov.maharashtra.mahabhumi-SATBR-PUN-BNR-112-2', why: 'Land record the AI check reads first', required: true },
    { id: 'property_card', name: 'Property card', issuer: 'Land Records Department, Maharashtra', uri: 'in.gov.maharashtra.landrecords-PRCRD-PUN-4412', why: 'City survey record of the plot' },
    { id: 'index_ii', name: 'Index II (registered sale deed)', issuer: 'IGR Maharashtra', uri: 'in.gov.maharashtra.igr-INDX2-HVL3-2019-8834', why: 'Proves the last registered transfer' },
    { id: 'tax_receipt', name: 'Property tax receipt 2025-26', issuer: 'Pune Municipal Corporation', uri: 'in.gov.pmc-PTAXR-2526-0911837', why: 'Shows no tax dues on the property' },
  ],
  buyer: [
    AADHAAR,
    PAN,
    { id: 'dl', name: 'Driving licence', issuer: 'Transport Department, Maharashtra', uri: 'in.gov.transport-DRVLC-MH1220190012345', why: 'Second photo ID for site visits and booking' },
  ],
  developer: [
    { ...AADHAAR, why: 'Authorised signatory KYC' },
    PAN,
    { id: 'coi', name: 'Certificate of incorporation', issuer: 'Ministry of Corporate Affairs', uri: 'in.gov.mca-CINCR-U45200PN2011PTC139876', why: 'Confirms the company that sells the units', required: true },
    { id: 'udyam', name: 'Udyam registration certificate', issuer: 'Ministry of MSME', uri: 'in.gov.msme-UDYAM-MH-26-0045112', why: 'Business registration on the developer profile' },
  ],
}

/** Sample Aadhaar for the connect step (not a real number). */
export const SAMPLE_AADHAAR = '9999 0000 4821'
