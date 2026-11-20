import { AlertCircle, ArrowLeft, Check, Send } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { usePersistentState } from '../app/persist'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { RecordId, SampleData } from '../components/ui/record-id'
import { TextareaField } from '../components/ui/textarea'
import { LAWYER_COMMENTS_SEED, type FindingComment } from '../data/fixtures/f06-lawyer'

/** F06-01 · Lawyer send back with comments to owner. */
export default function SendBackScreen() {
  const navigate = useNavigate()
  const [comments, setComments] = usePersistentState<FindingComment[]>('f06.comments', LAWYER_COMMENTS_SEED)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const updateComment = (id: string, text: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, initialComment: text } : c))
    )
  }

  const handleSend = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
      setTimeout(() => {
        navigate(path('F06-02'))
      }, 1200)
    }, 600)
  }

  return (
    <Screen id="F06-01" role="lawyer" back={path('GP-13')} title="Send back with comments">
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-4 py-6 xl:py-8">
        <div className="flex flex-col gap-1">
          <Link to={path('GP-13')} className="inline-flex items-center gap-1.5 text-small text-muted hover:text-text hover:underline">
            <ArrowLeft className="size-4" />
            <span>Lawyer queue</span>
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              <span className="text-label text-muted">Lawyer view · Adv. Meera Joshi</span>
              <h1 className="text-h1 font-semibold text-text">Send back to owner</h1>
            </div>
            <div className="flex items-center gap-2">
              <RecordId id="RA-PUN-001-A-18-04" />
              <SampleData />
            </div>
          </div>
        </div>

        <Card className="flex flex-col gap-6">
          <div className="rounded-control bg-warning-tint p-4 text-small text-warning-ink border border-line">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="size-5 flex-none mt-0.5" />
              <div>
                <b>Important:</b> The owner sees these comments verbatim on their dashboard. Sign-off stays locked until all flagged questions are clarified.
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {comments.map((c) => (
              <div key={c.id} className="flex flex-col gap-2 rounded-control border border-line p-4">
                <div className="flex flex-col">
                  <span className="text-body font-semibold text-text">Comment on finding: {c.findingTitle}</span>
                  <span className="text-small text-muted">{c.findingSub}</span>
                </div>
                <TextareaField
                  label="Lawyer comment"
                  value={c.initialComment}
                  onChange={(e) => updateComment(c.id, e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <Button variant="secondary" to={path('GP-14')}>
              Cancel
            </Button>
            <div className="flex items-center gap-3">
              {sent && (
                <span className="flex items-center gap-1.5 text-small font-medium text-success-ink">
                  <Check className="size-4" /> Comments sent to owner!
                </span>
              )}
              <Button
                loading={loading}
                disabled={sent}
                onClick={handleSend}
                icon={<Send className="size-3.5" />}
              >
                Send comments to owner
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Screen>
  )
}
