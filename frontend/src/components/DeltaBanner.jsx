export function DeltaBanner({ delta }) {
  if (!delta) return null
  const { has_changed, new_cases, hours_since_change,
          who_confirmed, generated_at } = delta

  const ts = generated_at
    ? new Date(generated_at).toUTCString().replace(' GMT', ' UTC')
    : ''

  if (has_changed && new_cases > 0) {
    return (
      <div className="delta alert" role="alert" aria-live="assertive">
        <span className="dot" aria-hidden="true" />
        WHO CONFIRMED CASE UPDATE — {who_confirmed} TOTAL CONFIRMED
        {ts ? ` · ${ts}` : ''}
      </div>
    )
  }
  return (
    <div className="delta ok" aria-live="polite">
      <span className="dot" aria-hidden="true" />
      NO NEW CONFIRMED CASES IN THE LAST{' '}
      {hours_since_change < 1
        ? '60 MIN'
        : `${Math.round(hours_since_change)}H`}
      {' '}· WHO SOURCED
    </div>
  )
}
