import { Check, Moon, Share2, Sun } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { RecordId, SampleData } from '../../../components/ui/record-id'
import { cn } from '../../../lib/cn'

/** F14-05 · 3D preview with light toggle and publish to record. */
export default function PreviewScreen() {
  const navigate = useNavigate()
  const [light, setLight] = useState<'morning' | 'evening'>('morning')
  const [published, setPublished] = useState(false)

  const handlePublish = () => {
    setPublished(true)
    setTimeout(() => {
      navigate(path('F04-01'))
    }, 1000)
  }

  return (
    <Screen id="F14-05" role="developer" back={path('F14-01')} title="3D Preview">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 py-6 xl:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <span className="text-label text-muted">Asset Preview</span>
            <h1 className="text-h1 font-bold text-text">3D preview · A-1804</h1>
          </div>
          <div className="flex rounded-control border border-line bg-canvas p-0.5 text-chip font-medium">
            <button
              type="button"
              onClick={() => setLight('morning')}
              className={cn('flex items-center gap-1.5 rounded-[4px] px-3 py-1 transition-colors', light === 'morning' ? 'bg-primary text-on-primary' : 'text-muted')}
            >
              <Sun className="size-3.5" />
              ☀ Morning
            </button>
            <button
              type="button"
              onClick={() => setLight('evening')}
              className={cn('flex items-center gap-1.5 rounded-[4px] px-3 py-1 transition-colors', light === 'evening' ? 'bg-primary text-on-primary' : 'text-muted')}
            >
              <Moon className="size-3.5" />
              ☾ Evening
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Main 3D Canvas */}
          <div className="relative min-h-[440px] overflow-hidden rounded-card border border-line bg-sunken flex items-center justify-center p-8 xl:col-span-8 xl:min-h-[540px]">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-64 items-center justify-center rounded-card border border-line bg-gradient-to-b from-surface to-canvas p-6 shadow-e2">
                <div className="flex flex-col items-center gap-2">
                  <div className="size-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <span className="text-label font-medium text-text">GLB 3D Viewer</span>
                  <span className="text-overline text-muted">{light === 'morning' ? 'Morning sun simulation (East)' : 'Evening diffused light (West)'}</span>
                </div>
              </div>
              <span className="text-overline text-muted">3D model viewer placeholder · drag to look around</span>
            </div>
          </div>

          {/* Right Rail: Publish Card */}
          <div className="flex flex-col gap-4 xl:col-span-4">
            <Card className="flex flex-col gap-5 p-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <RecordId id="RA-PUN-001-A-18-04" />
                  <SampleData />
                </div>
                <h2 className="text-h2 font-semibold text-text">Publish to record</h2>
              </div>

              <div className="flex flex-col gap-2 rounded-control border border-line bg-canvas p-3.5 text-small">
                <div className="flex justify-between">
                  <span className="text-muted">Model file:</span>
                  <span className="font-semibold text-text">Valid GLB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">File size:</span>
                  <span className="font-mono text-text">48 MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Poly count:</span>
                  <span className="font-mono text-text">142,000 tris</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Textures:</span>
                  <span className="text-text">4K PBR Materials</span>
                </div>
              </div>

              {published ? (
                <div className="flex items-center gap-2 rounded-control bg-success-tint p-3 text-small text-success-ink font-semibold">
                  <Check className="size-4" /> Published to Digital Twin!
                </div>
              ) : (
                <Button size="lg" onClick={handlePublish} icon={<Share2 className="size-4" />}>
                  Publish to record
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Screen>
  )
}
