/**
 * _ScreenScaffold — placeholder chrome for an unbuilt screen.
 *
 * Renders a screen's identity, its DESIGN.md reference, and flow navigation so the shell is walkable
 * before any real UI exists. Screen stubs wrap this; replace a screen's body with the real UI (built
 * from tokens + mock data + BRAND.md copy) when its hi-fi lands. This helper is scaffolding, not a
 * product component — real reusable components live in src/components/.
 */

import { Link } from 'react-router-dom';
import { SCREENS, type ScreenDef } from './registry';

export function ScreenScaffold({ screen }: { screen: ScreenDef }) {
  return (
    <div className="screen">
      <p style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted)' }}>
        Screen {screen.id} · {screen.designRef}
      </p>
      <h1 style={{ fontSize: 'var(--font-size-title)', margin: 'var(--space-2) 0' }}>{screen.title}</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)' }}>{screen.note}</p>

      <p
        style={{
          fontSize: 'var(--font-size-caption)',
          color: 'var(--color-text-muted)',
          border: '1px dashed var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3)',
          marginBottom: 'var(--space-5)',
        }}
      >
        Placeholder — no UI yet. Build this screen from tokens, mock data, and BRAND.md copy when the
        hi-fi is imported (see CLAUDE.md → “Importing screens later”).
      </p>

      <nav aria-label="Screen flow" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <span style={{ fontSize: 'var(--font-size-label)', fontWeight: 'var(--font-weight-medium)' as never }}>
          Flow
        </span>
        {SCREENS.map((s) => (
          <Link
            key={s.id}
            to={s.path}
            style={{
              textDecoration: 'none',
              fontWeight: (s.id === screen.id ? 'var(--font-weight-bold)' : 'var(--font-weight-regular)') as never,
              color: s.id === screen.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
            }}
          >
            {s.id}. {s.title}
          </Link>
        ))}
      </nav>
    </div>
  );
}
