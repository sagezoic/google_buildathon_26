import { Download, Minus, Plus, ShieldCheck, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Screen } from '../../../app/Shell'
import { Button } from '../../../components/ui/button'
import { MARATHI_EXTRACT_RECORD } from '../../../data/fixtures/f04-twin'
import { downloadBlob, makePdf } from '../../../lib/mini-pdf'
import { cn } from '../../../lib/cn'

/** F04-03 · Full-screen document viewer with Marathi & English translation. */
export default function DocViewerScreen() {
  const navigate = useNavigate()
  const [langMode, setLangMode] = useState<'orig' | 'both'>('both')
  const [zoom, setZoom] = useState(100)
  const [page, setPage] = useState<1 | 2>(1)
  const [isDownloading, setIsDownloading] = useState(false)

  const doc = MARATHI_EXTRACT_RECORD

  const handleDownload = () => {
    setIsDownloading(true)
    setTimeout(() => {
      const pdfBlob = makePdf([
        `Document: Village Form 7/12 Extract`,
        `Record ID: ${doc.id}`,
        `Village: ${doc.villageEn} (${doc.villageMr})`,
        `Taluka: ${doc.talukaEn} | District: ${doc.districtEn}`,
        `Survey / Gat No: ${doc.gatEn}`,
        `Total Area: ${doc.areaEn}`,
        `Occupant / Owner: ${doc.ownerEn} (${doc.ownerMr})`,
        `Land Use: ${doc.useEn}`,
        `Anchored Fingerprint: ${doc.fingerprint}`,
      ])
      downloadBlob(pdfBlob, 'Village-Form-7-12-Extract.pdf')
      setIsDownloading(false)
    }, 600)
  }

  return (
    <Screen id="F04-03" layout="app" title="Document Viewer">
      <div className="flex flex-1 flex-col bg-sunken">
        {/* Top toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 xl:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={<X className="size-4" />}>
              Close
            </Button>
            <div className="h-4 w-px bg-line" />
            <div className="flex flex-col">
              <span className="text-small font-semibold text-text">7/12 extract</span>
              <span className="font-mono text-overline text-muted">{doc.id} · page {page} of 2</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex rounded-control border border-line bg-canvas p-0.5 text-chip font-medium">
              <button
                type="button"
                onClick={() => setLangMode('orig')}
                className={cn('rounded-[4px] px-2.5 py-1 transition-colors', langMode === 'orig' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                Original
              </button>
              <button
                type="button"
                onClick={() => setLangMode('both')}
                className={cn('rounded-[4px] px-2.5 py-1 transition-colors', langMode === 'both' ? 'bg-primary text-on-primary' : 'text-muted hover:text-text')}
              >
                Original + English
              </button>
            </div>

            <div className="flex items-center gap-1 rounded-control border border-line bg-surface px-1.5 py-0.5 text-chip">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(75, z - 10))}
                className="flex size-7 items-center justify-center rounded-[4px] text-muted hover:bg-canvas hover:text-text"
                aria-label="Zoom out"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-10 text-center font-mono text-small">{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(150, z + 10))}
                className="flex size-7 items-center justify-center rounded-[4px] text-muted hover:bg-canvas hover:text-text"
                aria-label="Zoom in"
              >
                <Plus className="size-3.5" />
              </button>
            </div>

            <Button
              variant="secondary"
              size="sm"
              loading={isDownloading}
              onClick={handleDownload}
              icon={<Download className="size-3.5" />}
            >
              Download
            </Button>
          </div>
        </div>

        {/* Document canvas */}
        <div className="flex flex-1 justify-center overflow-auto p-4 xl:p-8">
          <div
            className="flex w-full max-w-[850px] flex-col gap-6 rounded-card border border-line bg-surface p-6 shadow-e2 xl:p-10"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            {/* Header of 7/12 */}
            <div className="flex flex-col items-center border-b border-line pb-4 text-center">
              <span className="text-h2 font-bold text-text">{doc.titleMr}</span>
              {langMode === 'both' && (
                <span className="text-small font-medium text-muted">{doc.titleEn}</span>
              )}
            </div>

            {/* Geographical Hierarchy Table */}
            <div className="grid grid-cols-3 divide-x divide-line rounded-control border border-line text-center text-small">
              <div className="p-2.5">
                <div className="text-overline text-muted">मौजे / Village</div>
                <div className="font-semibold">{doc.villageMr} {langMode === 'both' && `(${doc.villageEn})`}</div>
              </div>
              <div className="p-2.5">
                <div className="text-overline text-muted">तालुका / Taluka</div>
                <div className="font-semibold">{doc.talukaMr} {langMode === 'both' && `(${doc.talukaEn})`}</div>
              </div>
              <div className="p-2.5">
                <div className="text-overline text-muted">जिल्हा / District</div>
                <div className="font-semibold">{doc.districtMr} {langMode === 'both' && `(${doc.districtEn})`}</div>
              </div>
            </div>

            {/* Content Fields */}
            <div className="flex flex-col divide-y divide-line rounded-control border border-line">
              <div className="grid grid-cols-1 gap-2 p-3.5 sm:grid-cols-2">
                <div>
                  <span className="text-label text-muted">भूमापन क्रमांक व उपविभाग / Survey & Sub-division:</span>
                  <div className="text-body font-semibold">{doc.gatMr} {langMode === 'both' && `(${doc.gatEn})`}</div>
                </div>
                <div>
                  <span className="text-label text-muted">एकूण क्षेत्र / Total Area:</span>
                  <div className="text-body font-semibold">{doc.areaMr} {langMode === 'both' && `(= ${doc.areaEn})`}</div>
                </div>
              </div>

              <div className="p-3.5">
                <span className="text-label text-muted">भोगवटादाराचे नाव / Occupant Name:</span>
                <div className="text-h3 font-bold text-text">{doc.ownerMr} {langMode === 'both' && `(${doc.ownerEn})`}</div>
              </div>

              <div className="p-3.5">
                <span className="text-label text-muted">वापर / Land Use:</span>
                <div className="text-body font-semibold">{doc.useMr} {langMode === 'both' && `(${doc.useEn})`}</div>
              </div>
            </div>

            {/* Fingerprint verification box */}
            <div className="flex flex-col gap-2 rounded-card border-2 border-chain bg-chain-tint p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-chain-ink font-semibold">
                  <ShieldCheck className="size-5" />
                  <span>Fingerprint verified</span>
                </div>
                <span className="font-mono text-small text-chain-ink">{doc.fingerprint}</span>
              </div>
              <p className="text-small text-chain-ink">
                This file matches the cryptographic hash anchored on Ethereum testnet at transaction {doc.anchoredTx}.
              </p>
            </div>

            {/* Page navigation bar */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant={page === 1 ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setPage(1)}
              >
                Page 1
              </Button>
              <Button
                variant={page === 2 ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setPage(2)}
              >
                Page 2
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Screen>
  )
}
