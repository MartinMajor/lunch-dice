import Image from 'next/image';
import React, { useState } from 'react';
import { DinerData } from './DinerData';
import DinerRow from './DinerRow';
import { simulation } from './simulation.js';

function Diners() {
  const newDiner = {
    name: '',
    price: '',
    normalized: null,
    rolled: null,
  };

  const [dinersData, setDinersData] = useState<{
    diners: DinerData[];
    generating: boolean;
  }>({ diners: [newDiner, newDiner], generating: false });

  const addRow = () => {
    setDinersData({ ...dinersData, diners: [...dinersData.diners, newDiner] });
  };

  const generate = () => {
    setDinersData({ ...dinersData, generating: true });
    setTimeout(() => {
      const normalizedPrices = simulation(dinersData.diners.map((d) => +d.price));
      const diners = dinersData.diners.map((d, i) => {
        return { ...d, normalized: normalizedPrices[i] };
      });

      setDinersData({ ...dinersData, generating: false, diners: diners });
    }, 100);
  };

  const handleUpdateFactory = (index: number) => {
    return (data: DinerData) => {
      const diners = [...dinersData.diners];
      diners[index] = data;
      setDinersData({ ...dinersData, diners: diners });
    };
  };

  const handleDeleteFactory = (index: number) => {
    return () => {
      const diners = [...dinersData.diners];
      diners.splice(index, 1);
      setDinersData({ ...dinersData, diners: diners });
    };
  };

  return (
    <div className='flex flex-col content-between max-w-lg h-full bg-slate-100 rounded-xl shadow-lg overflow-hidden ring-1 ring-slate-300'>
      <div className='flex-auto'>
        <div className='flex items-center border-b border-slate-300'>
          <p className='flex-auto pl-4 text-lg font-thin'>Diners</p>
          <button
            type='button'
            className='flex-none px-3 py-1 bg-slate-200 hover:bg-slate-300'
            onClick={addRow}
          >
            <Image src='/plus.svg' alt='Add diner' width={24} height={24} priority />
          </button>
        </div>
        <div>
          {dinersData.diners.map((data: DinerData, index: number) => {
            return (
              <DinerRow
                key={index}
                data={data}
                index={index}
                handleUpdate={handleUpdateFactory(index)}
                handleDelete={handleDeleteFactory(index)}
              />
            );
          })}
        </div>
      </div>
      <div className='flex items-center border-t border-black'>
        <p className='basis-1/2 text-center'>
          <Image
            src='/coins.svg'
            alt='Totam price'
            width={24}
            height={24}
            priority
            className='inline mr-3'
          />
          <span>{dinersData.diners.reduce((a: number, b: DinerData) => a + +b.price, 0)}</span>
        </p>
        <button
          type='button'
          className='group basis-1/2 py-1 enabled:bg-slate-200 border-l border-black disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-slate-300'
          disabled={
            !dinersData.diners.every((data) => Number.parseFloat(data.price) > 0) ||
            dinersData.diners.length < 1 ||
            dinersData.generating
          }
          onClick={generate}
        >
          {dinersData.generating ? (
            <Image
              src='/spinner.svg'
              alt='Calculating prices'
              width={24}
              height={24}
              priority
              className='inline mr-3 animate-spin-slow'
            />
          ) : (
            <Image
              src='/calculate.svg'
              alt='Calculate prices'
              width={24}
              height={24}
              priority
              className='inline mr-3'
            />
          )}
          <span>Calculate</span>
        </button>
      </div>
    </div>
  );
}

export default Diners;
