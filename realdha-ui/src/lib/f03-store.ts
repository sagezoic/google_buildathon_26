import { useSharedState } from './shared-state'
import { SEED_DRAFTS, type AddForm, type DraftEntry, ADD_DEFAULT } from '../data/fixtures/f03-properties'

export const useAddForm = () => useSharedState<AddForm>('f03.add', ADD_DEFAULT)
export const useDrafts = () => useSharedState<DraftEntry[]>('f03.drafts', SEED_DRAFTS)

export interface IssueResult { how: string }
export type IssueResults = Partial<Record<string, IssueResult>>
const NONE: IssueResults = {}
export const useIssueResults = () => useSharedState<IssueResults>('f03.uploadIssues', NONE)

export interface ListUi { tab: 'all' | 'progress' | 'signed'; q: string; type: string; sort: 'recent' | 'title'; page: number }
export const LIST_DEFAULT: ListUi = { tab: 'all', q: '', type: 'All types', sort: 'recent', page: 1 }
export const useListUi = () => useSharedState<ListUi>('f03.list', LIST_DEFAULT)

/** "14:12" in IST. */
export function clock(ts: number) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(ts)
}
