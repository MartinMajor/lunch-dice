"use client";

import { useRef, useState } from "react";
import { RosterPlayer } from "@/types/game";

interface Props {
  roster: RosterPlayer[];
  sessionPlayerIds: string[];
  onAddExisting: (player: RosterPlayer, price: string) => void;
  onAddNew: (name: string, price: string) => Promise<void>;
  onClose: () => void;
}

export default function AddPlayerPicker({
  roster,
  sessionPlayerIds,
  onAddExisting,
  onAddNew,
  onClose,
}: Props) {
  const available = roster.filter((p) => !sessionPlayerIds.includes(p.id));

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activePrice, setActivePrice] = useState("");
  const [activePriceError, setActivePriceError] = useState(false);

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newError, setNewError] = useState("");
  const [savingNew, setSavingNew] = useState(false);

  const activePriceRef = useRef<HTMLInputElement>(null);
  const newNameRef = useRef<HTMLInputElement>(null);

  function selectRosterPlayer(id: string) {
    setActiveId(id);
    setActivePrice("");
    setActivePriceError(false);
    setTimeout(() => activePriceRef.current?.focus(), 50);
  }

  function confirmExisting() {
    const price = parseFloat(activePrice);
    if (!activeId || !(price > 0)) {
      setActivePriceError(true);
      return;
    }
    const player = roster.find((p) => p.id === activeId)!;
    onAddExisting(player, activePrice);
    setActiveId(null);
    setActivePrice("");
  }

  async function confirmNew() {
    const name = newName.trim();
    const price = parseFloat(newPrice);
    if (!name) { setNewError("Enter a name."); return; }
    if (!(price > 0)) { setNewError("Enter a valid price."); return; }

    setSavingNew(true);
    setNewError("");
    await onAddNew(name, newPrice);
    setSavingNew(false);
    setNewName("");
    setNewPrice("");
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-40 flex flex-col justify-end bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div className="bg-[#111118] border-t border-gold/20 rounded-t-2xl
                      max-h-[80vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gold/20 rounded-full" />
        </div>

        <div className="px-4 pb-8 flex flex-col gap-5">
          <h2 className="font-display text-gold tracking-widest text-sm text-center pt-2">
            ADD TO TODAY'S LUNCH
          </h2>

          {/* Existing roster members */}
          {available.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-cream/30 text-xs uppercase tracking-widest mb-1">
                From roster
              </p>
              {available.map((player) => (
                <div key={player.id}>
                  {activeId !== player.id ? (
                    <button
                      onClick={() => selectRosterPlayer(player.id)}
                      className="w-full text-left px-4 py-3 rounded-lg text-cream
                                 bg-white/5 hover:bg-white/10 transition-colors
                                 font-display tracking-wide text-sm"
                    >
                      {player.name}
                    </button>
                  ) : (
                    <div className="bg-felt border border-gold/30 rounded-lg px-4 py-3
                                    flex items-center gap-3">
                      <span className="text-cream font-display text-sm flex-1">
                        {player.name}
                      </span>
                      <span className="text-cream/40 text-sm">$</span>
                      <input
                        ref={activePriceRef}
                        type="number"
                        inputMode="decimal"
                        min="0.01"
                        step="0.01"
                        value={activePrice}
                        onChange={(e) => {
                          setActivePrice(e.target.value);
                          setActivePriceError(false);
                        }}
                        onKeyDown={(e) => { if (e.key === "Enter") confirmExisting(); }}
                        placeholder="0.00"
                        className={`w-20 bg-casino-black/60 border rounded px-2 py-1 text-sm
                                    text-cream outline-none transition-colors
                                    [appearance:textfield]
                                    [&::-webkit-outer-spin-button]:appearance-none
                                    [&::-webkit-inner-spin-button]:appearance-none
                                    ${activePriceError ? "border-danger-bright" : "border-gold/30 focus:border-gold/70"}`}
                      />
                      <button
                        onClick={confirmExisting}
                        className="text-gold text-xs bg-gold/20 hover:bg-gold/30
                                   px-3 py-1.5 rounded transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setActiveId(null)}
                        className="text-cream/30 hover:text-cream/60 transition-colors text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gold/10" />
            <span className="text-gold/30 text-xs">new person</span>
            <div className="flex-1 h-px bg-gold/10" />
          </div>

          {/* New person form */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <input
                ref={newNameRef}
                type="text"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setNewError(""); }}
                placeholder="Name"
                maxLength={50}
                className="flex-1 bg-felt border border-gold/20 text-cream
                           placeholder-cream/20 rounded px-3 py-2.5 text-sm
                           outline-none focus:border-gold/50 transition-colors"
              />
              <div className="flex items-center gap-1 bg-felt border border-gold/20 rounded px-3">
                <span className="text-cream/40 text-sm">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => { setNewPrice(e.target.value); setNewError(""); }}
                  placeholder="0.00"
                  className="w-20 bg-transparent text-cream placeholder-cream/20
                             text-sm outline-none
                             [appearance:textfield]
                             [&::-webkit-outer-spin-button]:appearance-none
                             [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            {newError && <p className="text-danger-bright text-xs">{newError}</p>}

            <button
              onClick={confirmNew}
              disabled={!newName.trim() || !newPrice || savingNew}
              className="w-full bg-gold/20 text-gold font-display tracking-widest text-xs
                         py-3 rounded transition-colors hover:bg-gold/30
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {savingNew ? "Adding…" : "+ Add New Person"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
