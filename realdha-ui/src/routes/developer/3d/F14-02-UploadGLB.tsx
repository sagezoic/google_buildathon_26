import { AlertCircle, Loader2, UploadCloud } from 'lucide-react'
import { useState } from 'react'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Pill } from '../../../components/ui/pill'

/** F14-02 · Upload GLB with progress and error states. */
export default function UploadGLBScreen() {
  const [progress] = useState(62)

  return (
    <Screen id="F14-02" role="developer" back={path('F14-01')} title="Upload GLB">
      <div className="mx-auto flex w-full max-w-[840px] flex-col gap-6 px-4 py-6 xl:py-10">
        <div className="flex flex-col gap-1 border-b border-line pb-4">
          <h1 className="text-h1 font-bold text-text">Upload GLB</h1>
          <p className="text-body text-muted">
            Upload your 3D digital asset in standard GLB format (up to 100 MB).
          </p>
        </div>

        <Card className="flex flex-col gap-6 p-6">
          {/* Dropzone */}
          <div className="flex flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-line bg-canvas p-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-surface text-primary shadow-e1">
              <UploadCloud className="size-6" />
            </div>
            <div>
              <span className="text-body font-semibold text-text">Drop a .glb file here</span>
              <p className="text-small text-muted">or browse your files · Up to 100 MB</p>
            </div>
          </div>

          {/* Files List */}
          <div className="flex flex-col divide-y divide-line rounded-control border border-line">
            {/* Uploading File */}
            <div className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-body font-medium text-text">tower_a_a1804.glb</span>
                  <div className="text-small text-muted">48 MB · {progress}%</div>
                </div>
                <Pill tone="info" icon={<Loader2 className="size-3.5 animate-spin" />}>
                  Uploading
                </Pill>
              </div>
              <div className="h-1.5 w-full rounded-full bg-skeleton">
                <div className="h-1.5 rounded-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Error File */}
            <div className="flex items-center justify-between p-4 bg-danger-tint/20">
              <div className="flex flex-col">
                <span className="text-body font-medium text-text">tower_b.obj</span>
                <span className="text-small text-danger">
                  Failed · Only .glb files are supported. Convert OBJ to GLB before uploading.
                </span>
              </div>
              <Pill tone="danger" icon={<AlertCircle className="size-3.5" />}>
                Failed
              </Pill>
            </div>
          </div>

          <div className="flex justify-between border-t border-line pt-4">
            <Button variant="secondary" to={path('F14-01')}>
              Cancel
            </Button>
            <Button to={path('F14-05')}>
              Continue to preview
            </Button>
          </div>
        </Card>
      </div>
    </Screen>
  )
}
