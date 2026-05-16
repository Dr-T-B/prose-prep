import { useState } from 'react'

export interface AoScores {
  ao1: number
  ao2: number
  ao3: number
  ao4: number
}

export interface AoSelfMarkProps {
  /** called when the user submits their marks */
  onSubmit?: (scores: AoScores) => void
}

type AoKey = keyof AoScores

interface AoDef {
  key: AoKey
  label: string
  ceiling: number
  badgeClass: string
  blurb: string
}

const AO_DEFS: AoDef[] = [
  {
    key: 'ao1',
    label: 'AO1',
    ceiling: 20,
    badgeClass: 'text-ao1',
    blurb: 'Informed personal response · accurate written expression',
  },
  {
    key: 'ao2',
    label: 'AO2',
    ceiling: 20,
    badgeClass: 'text-ao2',
    blurb: "Analysis of writers' methods and their effects",
  },
  {
    key: 'ao3',
    label: 'AO3',
    ceiling: 20,
    badgeClass: 'text-ao3',
    blurb: 'Contexts integrated to sharpen meaning',
  },
  {
    key: 'ao4',
    label: 'AO4',
    ceiling: 10,
    badgeClass: 'text-ao4',
    blurb: 'Comparison of texts threaded through the argument',
  },
]

const LEVEL_DESCRIPTORS = [
  'Level 1 — limited',
  'Level 2 — emerging',
  'Level 3 — clear',
  'Level 4 — controlled',
  'Level 5 — perceptive',
]

function levelFor(value: number, ceiling: number): string {
  if (value <= 0) return 'Level 0 — unattempted'
  const band = Math.ceil((value / ceiling) * 5)
  const index = Math.min(Math.max(band, 1), 5) - 1
  return LEVEL_DESCRIPTORS[index]
}

export default function AoSelfMark({ onSubmit }: AoSelfMarkProps) {
  const [scores, setScores] = useState<AoScores>({
    ao1: 10,
    ao2: 10,
    ao3: 10,
    ao4: 5,
  })

  const totalCeiling = AO_DEFS.reduce((sum, d) => sum + d.ceiling, 0)
  const totalScore = AO_DEFS.reduce((sum, d) => sum + scores[d.key], 0)

  const update = (key: AoKey, value: number) =>
    setScores(prev => ({ ...prev, [key]: value }))

  return (
    <section className="bg-paper border border-rule rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-serif text-xl text-ink">Self-mark your essay</h2>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">
            Reflective self-marks — slide each AO to where you think your essay lands. Not an official grade.
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-rule text-ink-muted flex-shrink-0">
          Preview — Mock Data
        </span>
      </div>

      <div className="space-y-4">
        {AO_DEFS.map(ao => {
          const value = scores[ao.key]
          return (
            <div key={ao.key} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full border border-rule text-[11px] font-bold uppercase tracking-wider ${ao.badgeClass}`}
                >
                  {ao.label}
                </span>
                <span className="text-xs text-ink-muted flex-1 leading-snug">{ao.blurb}</span>
                <span className="text-sm font-medium text-ink tabular-nums">
                  {value}<span className="text-ink-muted">/{ao.ceiling}</span>
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={ao.ceiling}
                value={value}
                onChange={e => update(ao.key, Number(e.target.value))}
                className="w-full"
                aria-label={`${ao.label} self-mark`}
              />
              <p className="text-[11px] text-ink-muted italic">{levelFor(value, ao.ceiling)}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-rule flex items-center justify-between gap-3">
        <p className="text-sm text-ink">
          Total: <span className="font-semibold">{totalScore}</span>
          <span className="text-ink-muted"> / {totalCeiling}</span>
        </p>
        <button
          onClick={() => onSubmit?.(scores)}
          className="px-5 py-2.5 rounded-xl bg-hard-times text-ink font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Save marks
        </button>
      </div>
    </section>
  )
}
