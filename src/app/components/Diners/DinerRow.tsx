import { RollFunctionContext } from '@/app/RollFunctionContext';
import Image from 'next/image';
import { useContext, useState } from 'react';
import { DinerData } from './DinerData';

type DinerRowsParams = {
  data: DinerData;
  index: number;
  handleUpdate: (data: DinerData) => void;
  handleDelete: () => void;
};

function DinerRow(params: DinerRowsParams) {
  const [generating, setGenerating] = useState(false);

  const rollFunction = useContext(RollFunctionContext);

  const deleteButton = (
    <button type='button' className='p-2' onClick={() => params.handleDelete()}>
      <Image src='/minus.svg' alt='Remove diner' width={24} height={24} priority />
    </button>
  );

  const rollButton = generating ? (
    <Image
      src='/spinner.svg'
      alt='Rolling the dice'
      width={32}
      height={32}
      priority
      className='animate-spin-slow'
    />
  ) : (
    <button
      type='button'
      className='m-auto basis-1/12 disabled:cursor-not-allowed disabled:opacity-50'
      disabled={!!params.data.rolled}
      onClick={() => {
        setGenerating(true);
        rollFunction()
          .then((rolled) => params.handleUpdate({ ...params.data, rolled: rolled }))
          .finally(() => setGenerating(false));
      }}
    >
      <Image src='/roll.svg' alt='Roll the dice' width={32} height={32} priority />
    </button>
  );

  return (
    <div className='flex flex-wrap justify-between items-center gap-2 bg-gray-200 p-2 border-b border-black last:border-b-0'>
      <select
        className='basis-4/12 p-2 rounded-md ring-1'
        disabled={!!params.data.normalized}
        value={params.data.name}
        onChange={(v) => params.handleUpdate({ ...params.data, name: v.target.value })}
      >
        <option value=''>👤 anonymous</option>
        <option>👨🏻‍🚀 Marty</option>
        <option>👨🏻‍🔬 Marťas</option>
        <option>👨🏻‍💻 Šiny</option>
        <option>➕ add new</option>
      </select>
      <input
        type='number'
        className='basis-4/12 p-2 rounded-md min-w-[3rem] ring-1'
        placeholder='price'
        value={params.data.price}
        disabled={!!params.data.normalized}
        onChange={(v) => params.handleUpdate({ ...params.data, price: v.target.value })}
      />
      <div>{params.data.normalized === null ? deleteButton : rollButton}</div>
      <p className='basis-3/12 text-center'>
        <span className='text-xs text-stone-600'>Normalized</span>
        <br />
        <span className='text-fuchsia-400 text-lg'>
          {params.data.normalized?.toFixed(2) || '?'}
        </span>
      </p>
      <p className='basis-3/12 text-center'>
        <span className='text-xs text-stone-600'>Rolled</span>
        <br />
        <span className='text-fuchsia-400 text-lg'>{params.data.rolled?.toFixed(0) || '?'}</span>
      </p>
      <p className='basis-3/12 text-center'>
        <span className='text-xs text-stone-600'>Result</span>
        <br />
        <span className='text-fuchsia-600 text-lg font-bold'>
          {params.data.rolled && params.data.normalized
            ? (params.data.rolled / params.data.normalized).toFixed(2)
            : '?'}
        </span>
      </p>
    </div>
  );
}

export default DinerRow;
