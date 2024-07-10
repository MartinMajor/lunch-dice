'use client';

import React, { useState } from 'react';
import {
  RollFunctionContext,
  offlineRollFunction,
  onlineRollFunction,
} from './RollFunctionContext';
import Dice from './components/Dice/Dice';
import Diners from './components/Diners/Diners';
import Header from './components/Header/Header';

export default function Home() {
  const [rollFunction, setRollFunction] = useState(() => onlineRollFunction);

  const stateHandler = (state: boolean) => {
    setRollFunction(() => (state ? onlineRollFunction : offlineRollFunction));
  };

  return (
    <>
      <RollFunctionContext.Provider value={rollFunction}>
        <Header stateHandler={stateHandler} />
        <main className='flex flex-wrap max-w-4xl p-4 m-auto'>
          <Dice />
          <div className='w-[32rem] mx-auto'>
            <Diners />
          </div>
        </main>
      </RollFunctionContext.Provider>
    </>
  );
}
