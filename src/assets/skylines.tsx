/**
 * skylines.tsx — placeholder destination art for trip cards.
 *
 * Stand-ins for real stock photography (egress is blocked in this environment). Each is a gradient +
 * line-art SVG in the same style as the original HomeScreen hero graphic — not a photo, just enough
 * shape to read as "a place" until real assets are dropped into src/assets/ later.
 */

export function LisbonSkyline() {
  return (
    <svg viewBox="0 0 342 148" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="lisbon-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2b2f52" />
          <stop offset="55%" stopColor="#3c3f6b" />
          <stop offset="130%" stopColor="#5a45d6" />
        </linearGradient>
      </defs>
      <rect width="342" height="148" fill="url(#lisbon-bg)" />
      <g fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1.5">
        <path d="M-10 96 C60 78 96 120 150 104 S250 70 360 96" />
        <path d="M-10 116 C70 104 110 138 168 122 S260 96 360 118" />
        <path d="M40 -10 L70 60 L58 150" />
        <path d="M150 -10 L150 40 L120 74 L134 150" />
        <path d="M250 -10 L232 56 L262 150" />
        <path d="M-10 40 L120 40 M180 40 L360 40" />
      </g>
      <path d="M-10 128 C90 118 150 150 360 130 L360 160 L-10 160 Z" fill="rgba(90,69,214,0.35)" />
    </svg>
  );
}

export function TokyoSkyline() {
  return (
    <svg viewBox="0 0 342 148" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="tokyo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2a1f45" />
          <stop offset="55%" stopColor="#5b2f6b" />
          <stop offset="130%" stopColor="#d6458f" />
        </linearGradient>
      </defs>
      <rect width="342" height="148" fill="url(#tokyo-bg)" />
      <g fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5">
        <path d="M10 150 L10 60 L26 60 L26 150" />
        <path d="M40 150 L40 30 L58 30 L58 150" />
        <path d="M76 150 L76 74 L88 60 L100 74 L100 150" />
        <path d="M120 150 L120 20 L136 20 L136 150 M120 40 L136 40 M120 60 L136 60" />
        <path d="M160 150 L160 50 L178 50 L178 150" />
        <path d="M200 150 L200 8 L206 8 L206 150 M190 30 L216 30" />
        <path d="M230 150 L230 84 L248 84 L248 150" />
        <path d="M270 150 L270 44 L292 44 L292 150" />
      </g>
      <path d="M-10 132 C90 122 150 150 360 128 L360 160 L-10 160 Z" fill="rgba(214,69,143,0.32)" />
    </svg>
  );
}

export function ParisSkyline() {
  return (
    <svg viewBox="0 0 342 148" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="paris-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1f2a45" />
          <stop offset="55%" stopColor="#33456b" />
          <stop offset="130%" stopColor="#4590d6" />
        </linearGradient>
      </defs>
      <rect width="342" height="148" fill="url(#paris-bg)" />
      <g fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5">
        <path d="M-10 130 L340 130" />
        <path d="M160 130 L160 100 L152 96 L152 60 L158 60 L158 44 L164 44 L164 60 L170 60 L170 96 L162 100 L162 130" />
        <path d="M156 44 L166 44 L161 26 Z" />
        <path d="M20 130 L20 96 L60 96 L60 130 M28 96 L28 130 M36 96 L36 130 M44 96 L44 130 M52 96 L52 130" />
        <path d="M260 130 L260 90 L300 90 L300 130 M268 90 L268 130 M276 90 L276 130 M284 90 L284 130 M292 90 L292 130" />
      </g>
      <path d="M-10 134 C90 126 150 150 360 132 L360 160 L-10 160 Z" fill="rgba(69,144,214,0.32)" />
    </svg>
  );
}
