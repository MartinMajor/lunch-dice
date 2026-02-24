"use client";

import ProbabilityBar from "./ProbabilityBar";

interface Props {
  name: string;
  selected: boolean;
  price?: string;
  probability?: number;
  onSelect?: () => void;
  onDeselect?: () => void;
  onPriceChange?: (value: string) => void;
}

export default function RosterCard({
  name,
  selected,
  price = "",
  probability = 0,
  onSelect,
  onDeselect,
  onPriceChange,
}: Props) {
  if (!selected) {
    return (
      <button
        onClick={onSelect}
        className="rounded-lg border border-gold/15 bg-white/3 p-4
                   flex items-center justify-center min-h-[60px]
                   hover:border-gold/30 hover:bg-white/5 transition-colors"
      >
        <span className="font-display tracking-wide text-sm text-cream/40 hover:text-cream/60">
          {name}
        </span>
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-gold/30 bg-white/5 px-4 py-3 flex flex-col gap-2">
      {/* Single row: name | $ input | × */}
      <div className="flex items-center gap-2">
        <span className="font-display tracking-wide text-sm text-cream flex-1 truncate">
          {name}
        </span>
        <span className="text-cream/40 text-sm flex-shrink-0">$</span>
        <input
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          min="0.01"
          step="0.01"
          value={price}
          onChange={(e) => onPriceChange?.(e.target.value)}
          autoFocus
          className="w-20 bg-transparent text-cream text-sm outline-none text-right
                     placeholder:text-cream/20
                     [appearance:textfield]
                     [&::-webkit-outer-spin-button]:appearance-none
                     [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          onClick={onDeselect}
          className="text-cream/30 hover:text-cream/60 text-xl leading-none flex-shrink-0"
          aria-label={`Remove ${name}`}
        >
          ×
        </button>
      </div>

      {/* Probability bar — always present to keep row height consistent */}
      <div className={parseFloat(price) > 0 ? "opacity-100" : "opacity-0"}>
        <ProbabilityBar probability={probability} />
      </div>
    </div>
  );
}
