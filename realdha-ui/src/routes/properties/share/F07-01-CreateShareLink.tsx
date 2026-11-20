import { ArrowLeft, Check, Copy, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { usePersistentState } from '../../../app/persist'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Switch } from '../../../components/ui/switch'
import { SEED_SHARE_LINKS, type ShareLinkRecord } from '../../../data/fixtures/f07-share'

const EXPIRIES = ['24 hours', '7 days', '30 days', 'Custom date'] as const

/** F07-01 · Create share link modal/screen. */
export default function CreateShareLinkScreen() {
  const navigate = useNavigate()
  const [links, setLinks] = usePersistentState<ShareLinkRecord[]>('f07.links', SEED_SHARE_LINKS)
  const [expiry, setExpiry] = useState<typeof EXPIRIES[number]>('7 days')
  const [includeDocs, setIncludeDocs] = useState(true)
  const [showOwner, setShowOwner] = useState(false)
  const [copied, setCopied] = useState(false)
  const sampleUrl = 'realdha.example/s/9fK2mQx7'

  const copyUrl = () => {
    navigator.clipboard?.writeText('https://' + sampleUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCreate = () => {
    const newLink: ShareLinkRecord = {
      id: `l-${Date.now()}`,
      code: '9fK2mQx7',
      url: sampleUrl,
      access: includeDocs ? 'Documents included' : 'Summary only',
      includeDocs,
      showOwner,
      status: 'Active',
      expiryLabel: expiry === '24 hours' ? 'Expires tomorrow' : expiry === '7 days' ? 'Expires 27 Nov 2026' : 'Expires 20 Dec 2026',
      views: 0,
      createdAt: 'Just now',
      log: [],
    }
    setLinks([newLink, ...links.filter((l) => l.code !== newLink.code)])
    navigate(path('F07-02'))
  }

  return (
    <Screen id="F07-01" back={path('F04-01')} title="Share record">
      <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6 px-4 py-6 xl:py-10">
        <div className="flex flex-col gap-1">
          <Link to={path('F04-01')} className="inline-flex items-center gap-1.5 text-small text-muted hover:text-text hover:underline">
            <ArrowLeft className="size-4" />
            <span>A-1804 · 3 BHK · RA-PUN-001-A-18-04</span>
          </Link>
          <div className="flex items-center justify-between pt-2">
            <h1 className="text-h1 font-semibold text-text">Share this record</h1>
            <Button variant="ghost" size="sm" to={path('F04-01')}>
              <X className="size-4" />
            </Button>
          </div>
          <p className="text-body text-muted">
            Anyone with the link can view. They do not need an account.
          </p>
        </div>

        <Card className="flex flex-col gap-5 p-6">
          {/* Expiry selection */}
          <div className="flex flex-col gap-2">
            <span className="text-label font-medium text-text">Link expires</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {EXPIRIES.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setExpiry(opt)}
                  className={`flex h-10 items-center justify-center rounded-control border text-small font-medium transition-colors ${
                    expiry === opt
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-line bg-surface text-muted hover:border-line-hover hover:text-text'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Include documents toggle */}
          <div className="flex items-center justify-between border-t border-line pt-4">
            <div className="flex flex-col pr-4">
              <span className="text-body font-semibold text-text">Include documents</span>
              <span className="text-small text-muted">
                {includeDocs
                  ? 'On: recipient can open verified sale deed and certificates.'
                  : 'Off: summary, status and on-chain proof only.'}
              </span>
            </div>
            <Switch checked={includeDocs} onChange={setIncludeDocs} aria-label="Include documents" />
          </div>

          {/* Show owner name toggle */}
          <div className="flex items-center justify-between border-t border-line pt-4">
            <div className="flex flex-col pr-4">
              <span className="text-body font-semibold text-text">Show owner name</span>
              <span className="text-small text-muted">
                {showOwner ? 'Visible to recipient' : 'Hidden by default'}
              </span>
            </div>
            <Switch checked={showOwner} onChange={setShowOwner} aria-label="Show owner name" />
          </div>

          {/* Generated URL box */}
          <div className="flex flex-col gap-1.5 border-t border-line pt-4">
            <span className="text-label text-muted">Link</span>
            <div className="flex items-center gap-2">
              <div className="flex h-control flex-1 items-center rounded-control border border-line bg-canvas px-3 font-mono text-small text-text">
                {sampleUrl}
              </div>
              <Button variant="secondary" onClick={copyUrl} icon={copied ? <Check className="size-4 text-success-ink" /> : <Copy className="size-4" />}>
                {copied ? 'Copied' : 'Copy link'}
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <Button variant="secondary" to={path('F04-01')}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              Create link
            </Button>
          </div>
        </Card>
      </div>
    </Screen>
  )
}
