import { Price } from '@/app/Price';
import * as React from 'react';
import { Diner } from './Diner';
import { PreviousDiner } from './PreviousDiner';

type Props = {
  type: 'new' | 'update';
  diner: Diner;
  // onAdd: (dinner: Diner) => void; // TODO: Implement onAdd and dialog local state
  onUpdate: (patch: Partial<Diner>) => void;
  onDelete: () => void;
  previousDiners: readonly PreviousDiner[];
};

export const DinerDialog = React.memo((props: Props) => {
  const [rawPrice, setRawPrice] = React.useState<string>('');
  const [rawName, setRawName] = React.useState<string>('');

  React.useEffect(() => {
    setRawPrice(props.diner.price?.toString() ?? '');
    setRawName(props.diner.name ?? '');
  }, [props.diner]);

  const filteredPreviousDiners = React.useMemo(
    () =>
      props.previousDiners.filter((previousDiner) => {
        const previousDinerNameLower = previousDiner.name.toLowerCase().trim();
        const nameLower = (rawName ?? '').toLowerCase().trim();

        if (nameLower === previousDinerNameLower) {
          return false;
        }

        return previousDinerNameLower.includes(nameLower);
      }),
    [rawName, props.previousDiners]
  );

  const name = React.useMemo(() => {
    const value = rawName.trim();

    if (value === '') {
      return null;
    }

    return value;
  }, [rawName]);

  const price = React.useMemo(() => {
    const value = Number.parseFloat(rawPrice.trim());

    if (Number.isFinite(value) === false) {
      return null;
    }

    if (value <= 0) {
      return null;
    }

    return Price(value);
  }, [rawPrice]);

  const isFormValid = React.useMemo(() => {
    return name != null && price != null;
  }, [name, price]);

  const updateHandler = () =>
    props.onUpdate({
      name: `${name ?? ''}`,
      price: price,
      normalizedPrice: null,
      rolled: null,
    });

  const deleteHandler = () => props.onDelete();

  return (
    <div className='fixed inset-0 z-30 flex flex-col items-center justify-center bg-black bg-opacity-10 p-6'>
      <div className='flex h-full max-h-[42rem] w-full max-w-96 flex-col gap-4 overflow-y-auto overflow-x-clip rounded-xl bg-white p-4 shadow-lg'>
        <div className='group flex rounded-md border-2 border-zinc-200 border-solid focus-within:border-amber-500'>
          <label
            htmlFor='edited_dinner_price'
            className='float-start flex aspect-square h-full shrink-0 select-none items-center justify-center text-zinc-400 group-focus-within:text-amber-600'
          >
            <span className='icon'>payments</span>
          </label>
          <input
            autoFocus
            id='edited_dinner_price'
            className='min-w-0 shrink grow bg-transparent p-2 text-center tabular-nums outline-none placeholder:text-center focus-visible:text-right'
            type='number'
            inputMode='decimal'
            placeholder='Price'
            value={rawPrice}
            onChange={({ currentTarget }) => setRawPrice(currentTarget.value)}
          />
          {price != null ? (
            <span
              className='flex shrink-0 cursor-pointer select-none items-center justify-center pr-2 text-zinc-300 group-focus-within:text-amber-600'
              onClick={() => setRawPrice('')}
            >
              <span className='icon'>close_small</span>
            </span>
          ) : (
            <label htmlFor='edited_dinner_price' className='opacity-0'>
              <span className='icon'>close_small</span>
            </label>
          )}
        </div>

        <div className='group flex rounded-md border-2 border-zinc-200 border-solid focus-within:border-amber-500'>
          <label
            htmlFor='edited_dinner_name'
            className='flex aspect-square h-full shrink-0 select-none items-center justify-center text-zinc-400 group-focus-within:text-amber-600'
          >
            <span className='icon'>face</span>
          </label>
          <input
            id='edited_dinner_name'
            className='min-w-0 shrink grow bg-transparent p-2 text-center outline-none placeholder:text-center focus-visible:text-left'
            type='text'
            placeholder='Diner'
            value={rawName ?? ''}
            onChange={({ currentTarget }) => setRawName(currentTarget.value)}
          />
          <span
            className={`${name == null ? 'pointer-events-none opacity-0' : ''} flex shrink-0 cursor-pointer select-none items-center justify-center pr-2 text-zinc-300 group-focus-within:text-amber-600`}
            onClick={() => name != null && setRawName('')}
          >
            <span className='icon'>close_small</span>
          </span>
        </div>

        {filteredPreviousDiners.length > 0 ? (
          <div className='flex flex-shrink select-none flex-col items-stretch overflow-y-auto overflow-x-clip rounded-md border-2 border-zinc-200 border-solid bg-zinc-50 focus-within:border-amber-500'>
            {filteredPreviousDiners.map((dinner, index) => (
              <React.Fragment key={`${dinner.name}-${index}`}>
                {index > 0 ? (
                  <div className='ml-2 border-2 border-zinc-200 border-b-0 border-solid' />
                ) : null}

                <div
                  className='group box-border flex cursor-pointer items-center gap-1 rounded-[inherit] border-2 border-zinc-50 p-2 font-medium text-sm text-zinc-800 leading-none hover:bg-zinc-100 active:bg-zinc-200 active:text-zinc-950'
                  onClick={() => setRawName(dinner.name)}
                >
                  <span>{dinner.emoji}</span>
                  <span className='tracking-wide'>{dinner.name}</span>
                  <span className='grow' />
                  <span className='icon text-zinc-200 group-hover:text-zinc-300 group-active:text-zinc-400'>
                    arrow_insert
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        ) : null}

        <div className='shrink grow' />

        {props.type === 'new' ? (
          <div className='flex gap-2'>
            <button
              onClick={deleteHandler}
              className='flex aspect-square h-9 flex-row items-center justify-center overflow-clip text-nowrap rounded-lg bg-zinc-200 p-2 font-medium text-zinc-600 hover:bg-zinc-300 hover:text-zinc-700 active:bg-zinc-400 active:text-zinc-800'
              type='button'
            >
              <span className='icon'>close</span>
            </button>

            <button
              onClick={updateHandler}
              disabled={!isFormValid}
              className='flex h-9 grow flex-row items-center justify-center gap-2 overflow-clip text-nowrap rounded-lg bg-amber-700 p-2 font-medium text-yellow-300 hover:bg-amber-800 hover:text-yellow-400 active:bg-amber-900 active:text-yellow-500 disabled:bg-zinc-50 disabled:text-zinc-400 disabled:outline disabled:outline-2 disabled:outline-zinc-200'
              type='button'
            >
              Add Diner
              <span className='icon'>person_add</span>
            </button>
          </div>
        ) : props.type === 'update' ? (
          <div className='grid grid-cols-2 gap-2'>
            <button
              onClick={deleteHandler}
              className='flex h-9 grow flex-row items-center justify-center gap-2 overflow-clip text-nowrap rounded-lg bg-red-700 p-2 font-medium text-red-50 hover:bg-red-800 hover:text-red-100 active:bg-red-900 active:text-red-200'
              type='button'
            >
              <span className='icon icon-fill'>delete_forever</span>
              Remove
            </button>

            <button
              onClick={updateHandler}
              disabled={!isFormValid}
              className='flex h-9 grow flex-row items-center justify-center gap-2 overflow-clip text-nowrap rounded-lg bg-amber-700 p-2 font-medium text-yellow-300 hover:bg-amber-800 hover:text-yellow-400 active:bg-amber-900 active:text-yellow-500 disabled:bg-zinc-50 disabled:text-zinc-400 disabled:outline disabled:outline-2 disabled:outline-zinc-200'
              type='button'
            >
              Save
              <span className='icon'>check</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
});
