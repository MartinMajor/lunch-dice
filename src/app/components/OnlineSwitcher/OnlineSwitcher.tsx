import React, { useState } from 'react';

function OnlineSwitcher({ stateHandler }: { stateHandler: (state: boolean) => void }) {
  const [state, setState] = useState(true);

  return (
    <label className='relative inline-flex cursor-pointer items-center'>
      <input
        type='checkbox'
        value='1'
        checked={state}
        className='peer sr-only'
        onChange={(e) => {
          setState(e.target.checked);
          stateHandler(e.target.checked);
        }}
      />
      <div className='peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-offline after:transition-all after:content-[""] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:after:bg-online peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300' />
    </label>
  );
}

export default OnlineSwitcher;
