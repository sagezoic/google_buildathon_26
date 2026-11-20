import { useEffect, useState } from 'react'
import { ArrowLeft, MapPin, Star } from 'lucide-react'
import { fetchSociety, formatInr, grossYield, type SocietyDetailData } from '../lib/flats-api'

interface SocietyDetailProps {
  societyId: string
  onBack: () => void
}

const NEARBY_LABEL: Record<string, string> = {
  park: 'Park',
  metro: 'Metro',
  rail: 'Railway',
  school: 'School',
  hospital: 'Hospital',
  shopping: 'Shopping',
}

const fmtDistance = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`)

export function SocietyDetail({ societyId, onBack }: SocietyDetailProps) {
  const [society, setSociety] = useState<SocietyDetailData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [photo, setPhoto] = useState(0)

  useEffect(() => {
    const c = new AbortController()
    setSociety(null)
    setError(null)
    setPhoto(0)
    fetchSociety(societyId, c.signal)
      .then(setSociety)
      .catch((err: unknown) => {
        if (!c.signal.aborted) setError(err instanceof Error ? err.message : 'Failed to load')
      })
    return () => c.abort()
  }, [societyId, attempt])

  const back = (
    <button type="button" className="society-back-btn" onClick={onBack}>
      <ArrowLeft size={16} /> Back to marketplace
    </button>
  )

  if (error) {
    return (
      <div className="society-detail">
        {back}
        <div className="lofty-empty-state" role="alert">
          <h3>Could not load this society</h3>
          <p>{error}</p>
          <button type="button" className="lofty-btn-primary" onClick={() => setAttempt((n) => n + 1)}>Try again</button>
        </div>
      </div>
    )
  }

  if (!society) {
    return (
      <div className="society-detail" aria-busy="true">
        {back}
        <div className="lofty-card lofty-card-skeleton society-skeleton" />
      </div>
    )
  }

  const s = society
  const photos = (s.images ?? []).map((i) => i.full || i.thumb).filter(Boolean)
  const yieldPct = grossYield(
    Object.fromEntries(s.bhk_prices.map((p) => [String(p.bhk), { buy_median: p.buy_median, rent_median: p.rent_median }])),
  )
  const nearby = Object.entries(s.nearby ?? {}).filter(([, v]) => typeof v?.m === 'number')
  const sale = s.listings.filter((l) => l.mode === 'sale').slice(0, 8)
  const rent = s.listings.filter((l) => l.mode === 'rent').slice(0, 8)

  return (
    <div className="society-detail">
      {back}

      <div className="society-hero">
        <div className="society-gallery">
          {photos.length ? (
            <>
              <img src={photos[photo % photos.length]} alt={s.name} className="society-gallery-main" />
              {photos.length > 1 && (
                <div className="society-gallery-thumbs">
                  {photos.slice(0, 8).map((p, i) => (
                    <button key={p} type="button" className={`society-thumb ${i === photo ? 'active' : ''}`} onClick={() => setPhoto(i)} aria-label={`Photo ${i + 1}`}>
                      <img src={p} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="society-gallery-empty">No photos available</div>
          )}
        </div>

        <div className="society-summary">
          <h1 className="society-title">{s.name}</h1>
          <p className="society-sub">
            <MapPin size={14} /> {[s.locality, s.pincode ? `Pune ${s.pincode}` : 'Pune'].filter(Boolean).join(', ')}
          </p>
          {s.developer && <p className="society-sub">By {s.developer}</p>}

          <dl className="society-facts">
            <div><dt>Price range</dt><dd>{formatInr(s.price_min)} – {formatInr(s.price_max)}</dd></div>
            <div><dt>Price per sqft</dt><dd>{s.psf_now != null ? formatInr(s.psf_now) : '–'}</dd></div>
            <div><dt>Gross yield</dt><dd>{yieldPct != null ? `${yieldPct.toFixed(1)}%` : '–'}</dd></div>
            <div><dt>Flat Finder score</dt><dd>{s.score != null ? `${s.score.toFixed(1)} / 10` : '–'}</dd></div>
            <div><dt>Status</dt><dd>{s.status ?? '–'}{s.possession ? ` · ${s.possession}` : ''}</dd></div>
            <div><dt>Size</dt><dd>{[s.units && `${s.units} units`, s.towers && `${s.towers} towers`, s.acres && `${s.acres} acres`].filter(Boolean).join(' · ') || '–'}</dd></div>
          </dl>

          {s.rating != null && (
            <p className="society-rating">
              <Star size={14} /> {s.rating.toFixed(1)} · {s.review_count ?? 0} reviews
            </p>
          )}
        </div>
      </div>

      {s.bhk_prices.length > 0 && (
        <section className="society-section">
          <h2>Prices by BHK</h2>
          <div className="society-table-wrap">
            <table className="society-table">
              <thead>
                <tr><th>BHK</th><th>Buy (median)</th><th>Buy range</th><th>Rent / month</th><th>₹ / sqft</th></tr>
              </thead>
              <tbody>
                {[...s.bhk_prices].sort((a, b) => a.bhk - b.bhk).map((p) => (
                  <tr key={p.bhk}>
                    <td>{p.bhk} BHK</td>
                    <td>{formatInr(p.buy_median)}</td>
                    <td>{p.buy_min != null && p.buy_max != null ? `${formatInr(p.buy_min)} – ${formatInr(p.buy_max)}` : '–'}</td>
                    <td>{formatInr(p.rent_median)}</td>
                    <td>{p.psf != null ? formatInr(p.psf) : '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {(sale.length > 0 || rent.length > 0) && (
        <section className="society-section">
          <h2>Sample listings</h2>
          <div className="society-listings">
            {[['For sale', sale], ['For rent', rent]].map(([title, rows]) =>
              (rows as typeof sale).length > 0 && (
                <div key={title as string}>
                  <h3>{title as string}</h3>
                  <ul>
                    {(rows as typeof sale).map((l, i) => (
                      <li key={l.id ?? i}>
                        <span>{l.bhk ? `${l.bhk} BHK` : 'Home'}{l.sqft ? ` · ${Math.round(l.sqft)} sqft` : ''}{l.floor ? ` · Floor ${l.floor}` : ''}</span>
                        <strong>{formatInr(l.price)}{l.mode === 'rent' ? '/mo' : ''}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>
        </section>
      )}

      {s.amenities && s.amenities.length > 0 && (
        <section className="society-section">
          <h2>Amenities</h2>
          <ul className="society-chips">
            {s.amenities.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </section>
      )}

      {nearby.length > 0 && (
        <section className="society-section">
          <h2>Nearby</h2>
          <ul className="society-nearby">
            {nearby.map(([k, v]) => (
              <li key={k}>
                <span>{NEARBY_LABEL[k] ?? k}</span>
                <strong>{fmtDistance(v.m)}</strong>
                {v.name && <small>{v.name}</small>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {s.reviews.length > 0 && (
        <section className="society-section">
          <h2>Resident reviews</h2>
          <ul className="society-reviews">
            {s.reviews.slice(0, 6).map((r, i) => (
              <li key={r.id ?? i}>
                <div className="society-review-head">
                  <strong>{r.title || 'Review'}</strong>
                  {r.rating != null && <span><Star size={12} /> {r.rating}</span>}
                </div>
                {r.text && <p>{r.text}</p>}
                <small>{[r.author, r.date].filter(Boolean).join(' · ')}</small>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
