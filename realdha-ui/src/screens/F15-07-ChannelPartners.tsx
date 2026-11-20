import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Screen } from '../app/Shell'
import { path } from '../app/nav'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Modal } from '../components/ui/modal'
import { Pill } from '../components/ui/pill'
import { CHANNEL_PARTNERS, type ChannelPartnerRecord } from '../data/fixtures/f15-devconsole'

/** F15-07 · Channel partners invite and access. */
export default function ChannelPartnersScreen() {
  const [partners, setPartners] = useState<ChannelPartnerRecord[]>(CHANNEL_PARTNERS)
  const [showInvite, setShowInvite] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    const newPartner: ChannelPartnerRecord = {
      id: `cp-${Date.now()}`,
      name: name || 'Authorized Broker',
      email,
      status: 'Active',
      access: 'All towers · view and share',
      leads: 0,
      commission: '2.0%',
    }
    setPartners([...partners, newPartner])
    setEmail('')
    setName('')
    setShowInvite(false)
  }

  return (
    <Screen id="F15-07" role="developer" back={path('F15-01')} title="Channel partners">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-4 py-6 xl:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h1 className="text-h1 font-bold text-text">Channel partners</h1>
            <p className="text-body text-muted">
              Manage authorized brokers, assign towers and track client registrations.
            </p>
          </div>
          <Button onClick={() => setShowInvite(true)} icon={<Plus className="size-4" />}>
            Invite partner
          </Button>
        </div>

        <Card className="flex flex-col overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-small">
              <thead className="border-b border-line bg-canvas text-label font-semibold text-muted">
                <tr>
                  <th className="px-4 py-3">Partner</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Access</th>
                  <th className="px-4 py-3">Leads</th>
                  <th className="px-4 py-3 text-right">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {partners.map((cp) => (
                  <tr key={cp.id} className="hover:bg-canvas/50">
                    <td className="px-4 py-3 font-semibold text-text">
                      {cp.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-muted">
                      {cp.email}
                    </td>
                    <td className="px-4 py-3">
                      <Pill tone={cp.status === 'Active' ? 'success' : 'neutral'}>
                        {cp.status}
                      </Pill>
                    </td>
                    <td className="px-4 py-3 text-text">
                      {cp.access}
                    </td>
                    <td className="px-4 py-3 font-medium text-text">
                      {cp.leads} leads
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-text">
                      {cp.commission}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Invite Modal */}
        <Modal open={showInvite} onOpenChange={setShowInvite} title="Invite Channel Partner">
          <form onSubmit={handleInvite} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cp-name" className="text-label font-medium text-text">
                Agency / Broker Name
              </label>
              <input
                id="cp-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pune Prime Brokers"
                className="h-control w-full rounded-control border border-line bg-surface px-3 text-small text-text outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cp-email" className="text-label font-medium text-text">
                Broker Email
              </label>
              <input
                id="cp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="broker@example.com"
                className="h-control w-full rounded-control border border-line bg-surface px-3 text-small text-text outline-none"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowInvite(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Send invitation
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Screen>
  )
}
