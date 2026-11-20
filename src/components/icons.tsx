/** Iconos SVG propios (trazo de 2px, heredan `currentColor`). */
import type { ModeId } from "@/lib/modes";

type P = { className?: string };
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const CrosshairIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="7" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
  </svg>
);

export const AbilityIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 2l3 7h7l-5.5 4.5L18.5 21 12 16.5 5.5 21l2-7.5L2 9h7z" />
  </svg>
);

export const QuoteIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 5h16v11H9l-5 4z" />
    <path d="M8.5 9.5h.01M12 9.5h.01M15.5 9.5h.01" strokeWidth={3} />
  </svg>
);

export const EmojiIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 14.5s1.5 2 4 2 4-2 4-2" />
    <path d="M9 9.5h.01M15 9.5h.01" strokeWidth={3} />
  </svg>
);

export const SkinIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M2 8h15l2-2h3v4l-3 1v2H12l-1.5 2.5V19H7l1-5H5l-1 2H2z" />
    <path d="M13 13v2.5" />
  </svg>
);

export const StatsIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 20V11M10 20V4M16 20v-6M22 20H2" />
  </svg>
);

export const SettingsIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

export const LockIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

export const BulbIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z" />
  </svg>
);

export const FlameIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 22c4 0 7-2.7 7-6.5 0-3.5-2.5-5.5-3.5-8.5-1 2-2 3-3.5 3 .5-3-1-6-3-8 0 4-4 6.5-4 11.5C5 19.3 8 22 12 22z" />
  </svg>
);

export const SearchIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-5-5" />
  </svg>
);

export const ArrowRightIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const CheckIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={3} className={className}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export const CrossIcon = ({ className }: P) => (
  <svg {...base} strokeWidth={3} className={className}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const ShareIcon = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" />
  </svg>
);

const MODE_ICONS: Record<ModeId, (p: P) => React.JSX.Element> = {
  classic: CrosshairIcon,
  ability: AbilityIcon,
  quote: QuoteIcon,
  emoji: EmojiIcon,
  skin: SkinIcon,
};

export function ModeIcon({ mode, className }: { mode: ModeId; className?: string }) {
  const Icon = MODE_ICONS[mode];
  return <Icon className={className} />;
}
