import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { Modal } from './modal'

const isImage = (name: string) => /\.(jpe?g|png)$/i.test(name)

/** Shows an uploaded document (PDF in the browser's viewer, JPG/PNG as an image) without leaving the page. */
export function DocPreview({ open, onOpenChange, title, fileName, src }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  fileName: string
  src: string
}) {
  const [failed, setFailed] = useState(false)
  return (
    <Modal open={open} onOpenChange={(o) => { if (!o) setFailed(false); onOpenChange(o) }} title={title} className="h-[calc(100dvh-32px)] max-w-[960px] overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-3 text-label text-muted">
          <span className="min-w-0 truncate">{fileName}</span>
          <a href={src} target="_blank" rel="noreferrer" className="inline-flex flex-none items-center gap-1 text-primary-text underline-offset-2 hover:underline">
            Open in new tab<ExternalLink className="size-3.5" aria-hidden />
          </a>
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-lg border border-line bg-sunken">
          {failed ? (
            <p role="alert" className="px-6 text-center text-small text-danger-ink">This file could not be loaded. It may have been removed, or the server is unreachable.</p>
          ) : isImage(fileName) ? (
            <img src={src} alt={fileName} onError={() => setFailed(true)} className="max-h-full max-w-full object-contain" />
          ) : (
            <iframe src={src} title={fileName} className="size-full border-0 bg-surface" />
          )}
        </div>
      </div>
    </Modal>
  )
}
