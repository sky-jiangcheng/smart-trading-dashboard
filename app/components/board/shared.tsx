import type { CSSProperties, ReactNode } from "react";

type ToneStyle = CSSProperties & {
  "--board-chip-tone"?: string;
  "--board-dimension-tone"?: string;
};

export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="board-metric-card">
      <div className="board-panel-label">{label}</div>
      <div className="board-metric-value">{value}</div>
    </div>
  );
}

export function SpotlightCard({
  eyebrow,
  title,
  meta,
  copy,
  chips,
}: {
  eyebrow: string;
  title: string;
  meta: string[];
  copy?: string;
  chips: string[];
}) {
  return (
    <div className="board-spotlight-card">
      <div className="board-panel-label">{eyebrow}</div>
      <div className="board-spotlight-title">{title}</div>
      {meta.length > 0 ? (
        <div className="board-spotlight-meta">
          {meta.filter(Boolean).map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      ) : null}
      {chips.length > 0 ? (
        <div className="board-chip-row board-chip-row-tight">
          {chips.map((chip) => (
            <span key={chip} className="board-chip">{chip}</span>
          ))}
        </div>
      ) : null}
      {copy ? <p className="board-spotlight-copy">{copy}</p> : null}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="board-empty-state">{children}</div>;
}

export function chipToneStyle(tone: string): ToneStyle {
  return { "--board-chip-tone": tone };
}

export function dimensionToneStyle(tone: string): ToneStyle {
  return { "--board-dimension-tone": tone };
}
