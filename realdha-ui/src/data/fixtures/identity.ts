/** Sample identity for the golden path (Prakash). No real data. */
export interface Identity {
  firstName: string
  phoneDesktop: string
  phoneMobile: string
  pan: string
  panMasked: string
  consentDate: string
}

export const prakash: Identity = {
  firstName: 'Prakash',
  phoneDesktop: '98765 43210',
  phoneMobile: '98220 11223',
  pan: 'ABCDE1234F',
  panMasked: 'ABCDE••34F',
  consentDate: '20 Nov 2026',
}
