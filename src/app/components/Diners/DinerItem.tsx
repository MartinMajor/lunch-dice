import { NormalizedRoll, getNormalizedRoll } from '@/app/NormalizedRoll';
import { maxRoll, useRandomRoll } from '@/app/RandomRollProvider';
import { dinersAtom } from '@/app/store';
import { pipe } from 'effect';
import { useAtomValue } from 'jotai';
import * as React from 'react';
import { NumericDisplay } from '../NumericDisplay';
import { Spinner } from '../Spinner/Spinner';
import { Diner } from './Diner';
import styles from './DinerItem.module.scss';

type Props = {
  actionType: 'edit' | 'roll';
  isLoser: boolean;
  isWinner: boolean;
  isLoading: boolean;
  diner: Diner;
  onUpdateDiner(patch: Partial<Diner>): void;
  openUpdateDialog: () => void;
};

export const DinerItem = React.memo((props: Props) => {
  const diners = useAtomValue(dinersAtom);

  const [isLocalLoading, setLocalLoading] = React.useState(false);
  const isLoading = props.isLoading || isLocalLoading;
  const randomRoll = useRandomRoll();

  /**
   * Get the maximum normalized roll of all diners.
   */
  const maxNormalizedRoll = React.useMemo(
    () =>
      pipe(
        diners.reduce((acc, diner) => {
          if (diner.normalizedPrice == null || diner.rolled == null) {
            return acc;
          }

          const normalizedRoll = getNormalizedRoll(diner.rolled, diner.normalizedPrice);
          return Math.max(acc, normalizedRoll);
        }, 0),
        (n) => (n > NormalizedRoll(0) ? n : null)
      ),
    [diners]
  );

  const normalizedRoll = React.useMemo(
    () =>
      props.diner.normalizedPrice != null && props.diner.rolled != null
        ? getNormalizedRoll(props.diner.rolled, props.diner.normalizedPrice)
        : null,
    [props.diner.normalizedPrice, props.diner.rolled]
  );

  const isOtherDinerRolled = React.useMemo(
    () => diners.some((diner) => diner.rolled != null && diner.id !== props.diner.id),
    [diners, props.diner.id]
  );

  const handleAction = React.useCallback(() => {
    if (isLoading) {
      return;
    }

    switch (props.actionType) {
      case 'edit':
        props.openUpdateDialog();
        break;

      case 'roll':
        {
          // TODO: Messy logic. Refactor.
          if (props.diner.rolled != null) {
            return;
          }

          setLocalLoading(true);
          randomRoll()
            .then((rolled) => props.onUpdateDiner({ rolled }))
            .finally(() => setLocalLoading(false));
        }
        break;

      default: {
        const _exhaustiveCheck: never = props.actionType;
        break;
      }
    }
  }, [
    props.actionType,
    props.onUpdateDiner,
    props.openUpdateDialog,
    props.diner,
    isLoading,
    randomRoll,
  ]);

  return (
    <div
      className={`group ${styles.DinerItem}`}
      data-is-loser={props.isLoser}
      data-is-winner={props.isWinner}
      onClick={handleAction}
    >
      <div className='pointer-events-none flex h-full w-full flex-col items-stretch justify-stretch '>
        <div className='flex grow flex-col items-center justify-end p-1'>
          <div
            className='flex w-full flex-shrink-0 flex-col items-center justify-center overflow-clip rounded-lg bg-stone-200 text-stone-600 transition-all duration-1000 ease-in-out group-[[data-is-loser=true]]:bg-red-300 group-[[data-is-winner=true]]:bg-green-200 group-[[data-is-loser=true]]:text-red-700 group-[[data-is-winner=true]]:text-green-600 '
            style={{
              height:
                normalizedRoll != null && maxNormalizedRoll != null
                  ? isOtherDinerRolled
                    ? `max(${Math.floor((normalizedRoll / maxNormalizedRoll) * 100)}%, 2rem)`
                    : '50%' // First roll
                  : '0%', // Before roll
            }}
          >
            <span className='p-2 font-medium text-xs tracking-widest'>
              {normalizedRoll != null ? (
                <NumericDisplay fractionLength={2}>{normalizedRoll}</NumericDisplay>
              ) : null}
            </span>
          </div>
        </div>
      </div>

      <div className='col-start-1 col-end-2 row-start-1 row-end-1 flex h-full w-full flex-col justify-between mobile-l:p-4 mobile-m:p-3 p-2'>
        <span className='flex items-center justify-between gap-1 leading-none'>
          <span className='text-nowrap'>
            {props.diner.emoji} {props.diner.name}
          </span>

          {isLoading ? <Spinner className=' text-zinc-400' /> : null}
        </span>

        <div className='icon-base icon-normal icon-fill flex items-end justify-end'>
          <span className='grow' />

          <div
            data-display-normalized-price={
              props.actionType === 'roll' && props.diner.normalizedPrice != null
            }
            className={`${styles.DinerItem__PriceGroup} group`}
          >
            <NumericDisplay className='text-right font-light mobile-l:text-3xl text-2xl tabular-nums leading-none mobile-l:leading-none tracking-tighter group-[[data-display-normalized-price=true]]:font-normal group-[[data-display-normalized-price=true]]:opacity-30'>
              {props.diner.price ?? 0}
            </NumericDisplay>

            <NumericDisplay className='text-right font-light mobile-l:text-3xl text-2xl tabular-nums leading-none mobile-l:leading-none tracking-tighter group-[[data-display-normalized-price=false]]:font-bold'>
              {props.diner.normalizedPrice ?? props.diner.price ?? 0}
            </NumericDisplay>
          </div>
        </div>
      </div>
    </div>
  );
});
