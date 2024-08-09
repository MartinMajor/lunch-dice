'use client';

import * as React from 'react';
import { RandomRollProvider } from './RandomRollProvider';
import { App } from './components/Diners/App';

export default React.memo(() => {
  return (
    <RandomRollProvider>
      <App />
    </RandomRollProvider>
  );
});
