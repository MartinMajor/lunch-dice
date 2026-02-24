interface Props {
  probability: number; // 0 to 1
}

export default function ProbabilityBar({ probability }: Props) {
  const pct = Math.round(probability * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gold/60 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-cream/70 w-8 text-right tabular-nums">{pct}%</span>
    </div>
  );
}
