export function MiniHero({ snapshot }) {
  const summary = snapshot?.snapshot?.situation_summary ?? ''
  if (!summary) return null;

  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text2)', lineHeight: '1.5' }}>
        {summary}
      </p>
    </div>
  )
}
