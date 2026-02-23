"use client";

import ProbabilityBar from "./ProbabilityBar";

interface Props {
  name: string;
  price: string;
  probability: number;
  onPriceChange: (value: string) => void;
  onRemove: () => void;
}

export default function PlayerCard({
  name,
  price,
  probability,
  onPriceChange,
  onRemove,
}: Props) {
  const isValid = parseFloat(price) > 0;

  return (
    <div className="bg-felt border border-gold/20 rounded-lg p-4 flex flex-col gap-3
                    transition-all duration-200">
      {/* Name row */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-cream font-display tracking-wide text-sm truncate">
          {name}
        </span>
        <button
          onClick={onRemove}
          className="text-cream/30 hover:text-danger-bright transition-colors
                     text-lg leading-none flex-shrink-0"
          aria-label={`Remove ${name}`}
        >
          ✕
        </button>
      </div>

      {/* Price input */}
      <div className="flex items-center gap-1.5">
        <span className="text-cream/40 text-sm">$</span>
        <input
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          value={price}
          onChange={(e) => onPriceChange(e.target.value)}
          placeholder="0.00"
          className="flex-1 bg-casino-black/60 border border-gold/20 text-cream
                     rounded px-2 py-1.5 text-sm outline-none min-w-0
                     focus:border-gold/60 transition-colors
                     [appearance:textfield]
                     [&::-webkit-outer-spin-button]:appearance-none
                     [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      {/* Probability bar — always reserve space to avoid layout shift */}
      <div className={isValid ? "opacity-100" : "opacity-0"}>
        <ProbabilityBar probability={probability} />
      </div>
    </div>
  );
}
