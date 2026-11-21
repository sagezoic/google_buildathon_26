import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Screen } from '../../../app/Shell'
import { path } from '../../../app/nav'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { StepPills, TextField } from '../../../components/ui/f10-parts'
import { useProject } from '../../../lib/f10-store'
import OsmMap from '../../../components/map/OsmMap'
import OsmPolygonEditor from '../../../components/map/OsmPolygonEditor'

/** F10-01 · Create project details. */
export default function CreateProjectScreen() {
  const navigate = useNavigate()
  const [project, setProject] = useProject()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const err: Record<string, string> = {}
    if (!project.name.trim()) err.name = 'Enter project name'
    if (!project.rera.trim()) err.rera = 'Enter RERA registration number'
    if (!project.city.trim()) err.city = 'Enter city'
    if (!project.locality.trim()) err.locality = 'Enter locality'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      navigate(path('F10-02'))
    }
  }

  return (
    <Screen id="F10-01" role="developer" back={path('F15-01')} title="Create project">
      <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-4 py-6 xl:py-8">
        <StepPills current={1} />

        <div className="flex flex-col gap-1 border-b border-line pb-4">
          <h1 className="text-h1 font-bold text-text">Create project</h1>
          <p className="text-body text-muted">
            Enter basic project details and RERA information to register new units.
          </p>
        </div>

        <Card className="flex flex-col gap-5 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Project name"
              value={project.name}
              error={errors.name}
              onChange={(e) => setProject({ ...project, name: e.target.value })}
              placeholder="e.g. Baner Heights"
            />
            <TextField
              label="RERA registration number"
              value={project.rera}
              error={errors.rera}
              onChange={(e) => setProject({ ...project, rera: e.target.value })}
              placeholder="e.g. P52100012345"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="City"
              value={project.city}
              error={errors.city}
              onChange={(e) => setProject({ ...project, city: e.target.value })}
              placeholder="e.g. Pune"
            />
            <TextField
              label="Locality"
              value={project.locality}
              error={errors.locality}
              onChange={(e) => setProject({ ...project, locality: e.target.value })}
              placeholder="e.g. Baner"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Possession date"
              value={project.possession}
              onChange={(e) => setProject({ ...project, possession: e.target.value })}
              placeholder="e.g. Dec 2027"
            />
            <TextField
              label="Description"
              value={project.description}
              onChange={(e) => setProject({ ...project, description: e.target.value })}
              placeholder="e.g. Two towers, 3 and 4 BHK."
            />
          </div>

          {/* Interactive location and site boundary creator */}
          <div className="flex flex-col gap-2 border-t border-line pt-4">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="text-chip font-semibold text-text">Site location & parcel demarcation</span>
              <span className="text-label text-muted">
                {project.locality || 'Baner'}, {project.city || 'Pune'} · Drag pin or adjust boundary
              </span>
            </div>
            <div className="relative h-64 w-full overflow-hidden rounded-control border border-line bg-sunken">
              <OsmMap
                center={[project.pin.lng ?? 73.7868, project.pin.lat ?? 18.559]}
                zoom={16}
                showThemeToggle
              >
                <OsmPolygonEditor
                  polygon={project.boundary ?? []}
                  pin={{ lng: project.pin.lng ?? 73.7868, lat: project.pin.lat ?? 18.559 }}
                  unit="acre"
                  onChange={(pts) => setProject({ ...project, boundary: pts })}
                  onPinChange={([lng, lat]) =>
                    setProject({
                      ...project,
                      pin: { ...project.pin, lng, lat },
                    })
                  }
                />
              </OsmMap>
            </div>
          </div>

          <div className="flex justify-between border-t border-line pt-4">
            <Button variant="secondary" to={path('F15-01')}>
              Cancel
            </Button>
            <Button onClick={handleNext}>
              Next: Towers and floors
            </Button>
          </div>
        </Card>
      </div>
    </Screen>
  )
}
