import { CircleCheck, CircleX, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { usePersistentState } from '../app/persist'
import { useDemoState } from '../app/useDemoState'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Pill } from '../components/ui/pill'
import { NARROW_NOTIFS, WIDE_NOTIFS, type NotifTone } from '../data/fixtures/x-flow'
import { cn } from '../lib/cn'
import { useNotifications } from '../lib/x-notifications'

const TONE: Record<NotifTone, { tone: 'danger' | 'success' | 'warning'; Icon: typeof CircleX }> = {
  danger: { tone: 'danger', Icon: CircleX },
  success: { tone: 'success', Icon: CircleCheck },
  warning: { tone: 'warning', Icon: TriangleAlert },
}

/** X-02 · Notifications centre. Read state is `x.notifications` (see src/lib/x-notifications.ts). */
export default function Notifications() {
  const [view] = useDemoState(['auto', 'unread', 'read'] as const)
  const [filter, setFilter] = usePersistentState<'all' | 'unread'>('x.notifications.filter', 'all')
  const { isRead, markRead, markAll } = useNotifications()
  const f = view === 'unread' ? 'unread' : view === 'read' ? 'all' : filter
  const wide = WIDE_NOTIFS.filter((n) => f === 'all' || !isRead(n.id))
  const narrow = NARROW_NOTIFS.filter((n) => f === 'all' || !isRead(n.id))
  const anyUnread = [...WIDE_NOTIFS, ...NARROW_NOTIFS].some((n) => !isRead(n.id))
  const empty = (
    <Card className="p-6 text-center text-small text-muted" role="status">You are all caught up.</Card>
  )
  return (
    <Screen id="X-02" back={path('X-01')} title="Alerts">
      <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col gap-4 p-4 xl:px-0 xl:py-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-h2 xl:text-h1">Notifications</h1>
          <Button variant="secondary" size="sm" disabled={!anyUnread} onClick={markAll} className="max-xl:h-11 max-xl:border-transparent max-xl:bg-transparent max-xl:px-2">Mark all read</Button>
        </div>
        <div role="group" aria-label="Filter" className="flex w-fit overflow-hidden rounded-control border border-line-strong bg-surface text-chip font-semibold max-xl:hidden">
          {(['all', 'unread'] as const).map((k) => (
            <button key={k} type="button" aria-pressed={f === k} onClick={() => setFilter(k)} className={cn('h-control-sm cursor-pointer px-4', f === k ? 'bg-primary text-on-primary' : 'text-text hover:bg-primary-tint')}>{k === 'all' ? 'All' : 'Unread'}</button>
          ))}
        </div>

        <div className="max-xl:hidden">
          {wide.length === 0 ? empty : (
            <Card className="overflow-hidden p-0">
              <ul>
                {wide.map((n) => {
                  const read = isRead(n.id)
                  return (
                    <li key={n.id} className="border-b border-line last:border-b-0">
                      <Link to={n.to} onClick={() => markRead(n.id)} className="flex items-center gap-3 px-4 py-3.5 text-text no-underline hover:bg-primary-tint">
                        <span aria-hidden className={cn('size-3 flex-none rounded-full border border-primary', !read && 'bg-primary')} />
                        <span className="rounded-control border border-line bg-sunken px-2 py-px text-label font-medium">{n.tag}</span>
                        <span className="min-w-0 flex-1">
                          <span className={cn('block text-small', read ? 'font-medium' : 'font-semibold')}>{n.title}</span>
                          <span className="block text-label text-muted">{n.body}</span>
                        </span>
                        <span className="text-label whitespace-nowrap text-muted">{n.at}</span>
                        {!read && <span className="text-label font-semibold text-primary-text">Unread</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-3 xl:hidden">
          {narrow.length === 0 && empty}
          {narrow.map((n) => {
            const { tone, Icon } = TONE[n.tone]
            const read = isRead(n.id)
            return (
              <Card key={n.id} className="flex flex-col gap-2.5 p-4">
                <span className="flex items-center gap-2 rounded-control bg-sunken px-3 py-1.5 font-mono text-small">
                  {!read && <span className="size-2 flex-none rounded-full bg-primary" aria-hidden />}{n.tag}{!read && <span className="sr-only"> (unread)</span>}
                </span>
                <Link to={n.to} onClick={() => markRead(n.id)} className={cn('text-h3 text-text no-underline', !read && 'font-semibold')}>{n.title}</Link>
                <span className="text-small text-muted">{n.at}</span>
                <div><Pill tone={tone} icon={<Icon className="size-3.5" />}>{n.status}</Pill></div>
                {n.action && <Button to={n.to} block onClick={() => markRead(n.id)} className="max-xl:h-12">{n.action}</Button>}
              </Card>
            )
          })}
        </div>
      </div>
    </Screen>
  )
}
