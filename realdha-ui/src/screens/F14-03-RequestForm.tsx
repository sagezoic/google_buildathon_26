import { FileText, Send } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { TextField } from '../components/ui/f10-parts'
import { TextareaField } from '../components/ui/textarea'

/** F14-03 · Request from floor plan form. */
export default function RequestFormScreen() {
  const navigate = useNavigate()
  const [target, setTarget] = useState('Tower A, floors 1 to 24')
  const [deadline, setDeadline] = useState('30 Nov 2026')
  const [notes, setNotes] = useState('Please model East-facing balconies and the 18th-floor clubhouse connection.')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(path('F14-04'))
  }

  return (
    <Screen id="F14-03" role="developer" back={path('F14-01')} title="Request 3D model">
      <div className="mx-auto flex w-full max-w-[800px] flex-col gap-6 px-4 py-6 xl:py-10">
        <div className="flex flex-col gap-1 border-b border-line pb-4">
          <h1 className="text-h1 font-bold text-text">Request from floor plan</h1>
          <p className="text-body text-muted">
            Realdha 3D experts will convert your architectural blueprints into web-ready GLB models.
          </p>
        </div>

        <Card className="flex flex-col gap-5 p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField
              label="Tower or unit"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              required
            />

            <TextField
              label="Required deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />

            {/* Attached files */}
            <div className="flex flex-col gap-1.5">
              <span className="text-chip font-semibold text-text">Attached floor plans</span>
              <div className="flex items-center gap-2 rounded-control border border-line bg-canvas p-3 text-small text-text">
                <FileText className="size-4 text-primary" />
                <span>2 files attached · tower_a_plan.pdf, typical_floor.pdf</span>
              </div>
            </div>

            <TextareaField
              label="Notes for 3D artist"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />

            <div className="flex justify-between border-t border-line pt-4">
              <Button variant="secondary" to={path('F14-01')}>
                Cancel
              </Button>
              <Button type="submit" icon={<Send className="size-3.5" />}>
                Submit request
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Screen>
  )
}
