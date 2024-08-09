'use client';

import { getNormalizedRoll } from '@/app/NormalizedRoll';
import { createDiner, dinersAtom } from '@/app/store';
import { useViewTransition } from '@/app/utils/useViewTransition';
import { useAtom } from 'jotai';
import * as React from 'react';
import { Spinner } from '../Spinner/Spinner';
import { Diner } from './Diner';
import { DinerDialog } from './DinerDialog';
import { DinerItem } from './DinerItem';
import { PreviousDiner } from './PreviousDiner';
import { computeNormalizedPrices } from './computeNormalizedPrices';

// TODO: This should be fetched from the server or loaded from some client storage
const previousDiners: readonly PreviousDiner[] = [
  { name: 'Marty', emoji: '🌟' },
  { name: 'Marťas', emoji: '🐼' },
  { name: 'Šiny', emoji: '🚀' },
  { name: 'Daviďák', emoji: '🍰' },
];

export const App = React.memo(() => {
  const [dinners, setDiners] = useAtom(dinersAtom);

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [actionType, setActionType] = React.useState<'edit' | 'roll'>('edit');
  const [editingDiner, setEditingDiner] = React.useState<{
    index: number;
    type: 'new' | 'update';
  } | null>(null);

  const startViewTransition = useViewTransition();

  const sortedDinersWithNormalizedRoll = React.useMemo(
    () =>
      dinners
        .map((diner) => ({
          ...diner,
          normalizedRoll:
            diner.normalizedPrice != null && diner.rolled != null
              ? getNormalizedRoll(diner.rolled, diner.normalizedPrice)
              : null,
        }))
        .filter(
          (diner): diner is NonNullableProp<typeof diner, 'normalizedRoll'> =>
            diner.normalizedRoll != null
        )
        .sort((dinerA, dinerB) => {
          const rollA = dinerA.normalizedRoll;
          const rollB = dinerB.normalizedRoll;

          if (rollA === rollB) {
            return 0;
          }

          if (rollA == null) {
            return 1;
          }

          if (rollB == null) {
            return -1;
          }

          return rollA - rollB;
        }),
    [dinners]
  );

  const loserDiner = React.useMemo(() => {
    if (actionType !== 'roll') {
      return null;
    }

    if (sortedDinersWithNormalizedRoll.length !== dinners.length) {
      return null;
    }

    return sortedDinersWithNormalizedRoll.at(0) ?? null;
  }, [dinners, sortedDinersWithNormalizedRoll, actionType]);

  const winnerDiners = React.useMemo(() => {
    if (actionType !== 'roll') {
      return [];
    }

    return sortedDinersWithNormalizedRoll.slice(1);
  }, [sortedDinersWithNormalizedRoll, actionType]);

  const addDiner = () =>
    startViewTransition(() => {
      setDiners((prev) => [...prev, createDiner()]);
      setEditingDiner({ index: dinners.length, type: 'new' });
    });

  const editDiner = (index: number) =>
    startViewTransition(() => setEditingDiner({ index, type: 'update' }));

  const generateNormalizedPrices = React.useCallback(() => {
    const shouldGenerate = dinners.some((diner) => diner.normalizedPrice == null);
    if (!shouldGenerate) {
      return;
    }

    setIsGenerating(true);
    // Debounce the generation to prevent the UI from freezing
    window.setTimeout(() => {
      const normalizedPrices = computeNormalizedPrices(dinners.map(({ price }) => price ?? 0));

      const nextDiners = dinners.map((diner, i): Diner => {
        return {
          ...diner,
          normalizedPrice: normalizedPrices[i],
        };
      });

      setDiners(nextDiners);
      setIsGenerating(false);
    }, 100);
  }, [dinners, setDiners]);

  return (
    <>
      <div className='flex h-dvh flex-col items-center'>
        <div className='grid w-full max-w-screen-laptop grid-cols-2 laptop:grid-cols-5 mobile-m:grid-cols-3 mobile-s:grid-cols-2 tablet:grid-cols-4 gap-3 mobile-l:gap-4 tablet:gap-5 laptop:p-5 p-3 tablet:p-4'>
          {dinners.map((dinner, index) => (
            <DinerItem
              onUpdateDiner={(patch) => {
                setDiners((prev) => {
                  const next = [...prev];
                  next[index] = {
                    ...next[index],
                    ...patch,
                  };

                  return next;
                });
              }}
              isLoser={loserDiner?.id === dinner.id}
              isWinner={winnerDiners.some((diner) => diner.id === dinner.id)}
              key={dinner.id}
              actionType={actionType}
              diner={dinner}
              openUpdateDialog={() => editDiner(index)}
              isLoading={isGenerating}
            />
          ))}

          {actionType === 'edit' ? (
            <button
              type='button'
              className='flex aspect-square flex-col items-center justify-center'
            >
              <div
                className='group flex h-full w-full cursor-pointer flex-col items-center justify-center overflow-clip rounded-xl bg-zinc-200 p-2 text-zinc-700 shadow-inner'
                onClick={addDiner}
              >
                <div className='icon-fill flex items-center justify-center rounded-full bg-white p-3 shadow-sm transition-shadow group-hover:shadow-md'>
                  <span className='icon icon-lg icon-light'>person_add</span>
                </div>
              </div>
            </button>
          ) : null}
        </div>

        <div className='fixed right-0 bottom-0 left-0 w-full bg-white shadow-2xl'>
          <div className='mx-auto grid w-full max-w-screen-laptop grid-cols-2'>
            <button
              data-selected={actionType === 'edit'}
              className='group mobile-l:-tracking-normal flex h-12 mobile-l:flex-row flex-col items-center justify-center gap-1 mobile-l:gap-2 font-semibold mobile-l:font-medium mobile-l:text-base text-xs leading-none tracking-wide transition-icon disabled:opacity-30 '
              onClick={() => startViewTransition(() => setActionType('edit'))}
              disabled={isGenerating}
              type='button'
            >
              <span className='contents group-[[data-selected=true]]:text-blue-600'>
                <span className='icon icon-fill icon-medium group-disabled:icon-no-fill'>edit</span>
                <span>Edit</span>
              </span>
            </button>

            <button
              data-selected={actionType === 'roll'}
              className='group mobile-l:-tracking-normal flex h-12 mobile-l:flex-row flex-col items-center justify-center gap-1 mobile-l:gap-2 font-semibold mobile-l:font-medium mobile-l:text-base text-xs leading-none tracking-wide transition-icon disabled:opacity-30'
              onClick={() => {
                if (isGenerating) {
                  return;
                }

                startViewTransition(() => setActionType('roll'));
                generateNormalizedPrices();
              }}
              disabled={dinners.length < 2}
              type='button'
            >
              <span className='contents group-[[data-selected=true]]:text-blue-600'>
                <span className='icon icon-fill icon-medium group-disabled:icon-no-fill'>
                  casino
                </span>
                <span>Roll</span>

                {isGenerating ? <Spinner className='text-base' /> : null}
              </span>
            </button>
          </div>
        </div>
      </div>

      {editingDiner != null ? (
        <DinerDialog
          type={editingDiner.type}
          diner={dinners[editingDiner.index]}
          onUpdate={(patch) =>
            startViewTransition(() => {
              setDiners((prev) => {
                const next = [...prev];
                next[editingDiner.index] = {
                  ...next[editingDiner.index],
                  ...patch,
                };

                return next;
              });
              setEditingDiner(null);
            })
          }
          onDelete={() =>
            startViewTransition(() => {
              setDiners((prev) => {
                const next = [...prev];
                next.splice(editingDiner.index, 1);

                return next;
              });
              setEditingDiner(null);
            })
          }
          previousDiners={previousDiners}
        />
      ) : null}
    </>
  );
});
