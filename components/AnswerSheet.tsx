// Hero illustration: a pencilled OMR answer sheet, marked in red pen, with a pencil resting on it.

const ROWS = 10;
const FILLED = [1, 3, 0, 2, 2, 1, 3, 0, 1, 2];
const WRONG = new Set([6]);
const BUBBLE_X = [124, 152, 180, 208];

export default function AnswerSheet() {
  return (
    <figure className="w-full">
      <svg viewBox="0 0 440 420" className="w-full overflow-visible" role="img" aria-label="Illustration of a marked answer sheet and a pencil">
        <g transform="rotate(-4 210 210)">
          <rect x="54" y="22" width="320" height="380" rx="6" fill="#e4e2dc" transform="translate(5 6)" />
          <rect x="54" y="22" width="320" height="380" rx="6" fill="#ffffff" stroke="#e4e2dc" />
          <line x1="88" y1="22" x2="88" y2="402" stroke="#d4442a" strokeOpacity="0.35" />

          <text x="104" y="54" fontSize="10" letterSpacing="2.4" fill="#121212" className="num">ANSWER SHEET</text>
          <text x="104" y="78" fontSize="9" fill="#a3a19b" className="num">NAME</text>
          <line x1="134" y1="80" x2="256" y2="80" stroke="#e4e2dc" />
          <path d="M138 77 c4 -9 7 -9 8 0 s4 -8 7 -1 3 -6 6 0 5 -7 9 -1 c3 4 5 -6 9 -2 s6 -5 10 1 4 -4 9 -1" fill="none" stroke="#4a4a4a" strokeWidth="1.1" strokeLinecap="round" />
          <text x="104" y="100" fontSize="9" fill="#a3a19b" className="num">PAPER  ANCIENT EGYPT · SET B</text>

          {BUBBLE_X.map((bx, j) => (
            <text key={j} x={bx} y="126" fontSize="8.5" fill="#a3a19b" textAnchor="middle" className="num">
              {"ABCD"[j]}
            </text>
          ))}
          {Array.from({ length: ROWS }, (_, i) => {
            const cy = 146 + i * 24;
            return (
              <g key={i}>
                <text x="104" y={cy + 3} fontSize="9.5" fill="#5f5e5a" textAnchor="end" className="num">
                  {String(i + 1).padStart(2, "0")}
                </text>
                {BUBBLE_X.map((bx, j) => (
                  <circle
                    key={j}
                    cx={bx}
                    cy={cy}
                    r="7"
                    fill={FILLED[i] === j ? "#2b2b2b" : "none"}
                    fillOpacity={FILLED[i] === j ? 0.88 : 0}
                    stroke="#121212"
                    strokeOpacity={FILLED[i] === j ? 0.9 : 0.28}
                  />
                ))}
                {WRONG.has(i) ? (
                  <path d={`M240 ${cy - 6} l11 11 M251 ${cy - 6} l-11 11`} stroke="#d4442a" strokeWidth="2" strokeLinecap="round" />
                ) : (
                  <path d={`M238 ${cy} l5 5 l10 -12`} fill="none" stroke="#d4442a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </g>
            );
          })}

          <g transform="translate(302 64)">
            <path
              d="M-30 6 C -31 -18, 24 -24, 30 -2 C 35 18, -8 26, -24 16 C -32 10, -30 -4, -14 -12"
              fill="none"
              stroke="#d4442a"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <text x="0" y="9" fontSize="24" fill="#d4442a" textAnchor="middle" fontStyle="italic" style={{ fontFamily: "var(--font-instrument-serif)" }}>
              9/10
            </text>
          </g>
        </g>

        <g transform="translate(206 372) rotate(-24)">
          <rect x="0" y="-8" width="190" height="16" fill="#e8b23a" />
          <rect x="0" y="-8" width="190" height="5" fill="#f2c55a" />
          <line x1="0" y1="2.5" x2="190" y2="2.5" stroke="#c9952a" strokeWidth="0.8" />
          <rect x="190" y="-8" width="16" height="16" fill="#b8b3a7" />
          <line x1="195" y1="-8" x2="195" y2="8" stroke="#8f8a7e" />
          <line x1="201" y1="-8" x2="201" y2="8" stroke="#8f8a7e" />
          <rect x="206" y="-8" width="16" height="16" rx="3" fill="#e79a8f" />
          <polygon points="0,-8 -26,0 0,8" fill="#ead2a8" />
          <polygon points="-17,-2.8 -26,0 -17,2.8" fill="#2b2b2b" />
        </g>
      </svg>
    </figure>
  );
}
