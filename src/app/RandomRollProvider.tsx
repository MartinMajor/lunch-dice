import { pipe } from 'effect';
import * as React from 'react';
import { Roll } from './Roll';
import { fetchWithTimeout } from './fetchWithTimeout';

export const minRoll = Roll(1);
export const maxRoll = Roll(10_000);

export function onlineRandomRoll(): Promise<Roll> {
  const url = new URL('https://www.random.org/integers/');
  url.searchParams.set('num', '1');
  url.searchParams.set('min', minRoll.toFixed(0));
  url.searchParams.set('max', maxRoll.toFixed(0));
  url.searchParams.set('col', '1');
  url.searchParams.set('base', '10');
  url.searchParams.set('format', 'plain');
  url.searchParams.set('rnd', 'new');

  return fetchWithTimeout(url, {
    timeout: 10_000,
    mode: 'cors',
  })
    .then((response) => response.text())
    .then((rawValue) => {
      const value = Number.parseInt(rawValue.trim());
      return Roll(value);
    });
}

export function offlineRandomRoll(): Promise<Roll> {
  return pipe(
    Math.random() * 10_000,
    (n) => Math.floor(n) + 1,
    (n) => Roll(n),
    (n) => Promise.resolve(n)
  );
}

const RollActionContext = React.createContext<
  Readonly<{
    rollFn: () => Promise<Roll>;
    mode: 'online' | 'offline';
    setMode: (mode: 'online' | 'offline') => void;
  }>
>({
  rollFn: onlineRandomRoll,
  mode: 'online',
  setMode: () => {},
});

export function useRandomRoll() {
  const { rollFn } = React.useContext(RollActionContext);
  return rollFn;
}

export function useRandomRollMode() {
  const { mode, setMode } = React.useContext(RollActionContext);
  return [mode, setMode] as const;
}

type Props = {
  children: React.ReactNode;
};

export const RandomRollProvider = (props: Props) => {
  const [rollFn, setRollFn] = React.useState(() => onlineRandomRoll);
  const [mode, setMode] = React.useState<'online' | 'offline'>('online');

  React.useEffect(() => {
    setRollFn(() => (mode === 'online' ? onlineRandomRoll : offlineRandomRoll));
  }, [mode]);

  return (
    <RollActionContext.Provider
      value={{
        rollFn,
        mode,
        setMode,
      }}
    >
      {props.children}
    </RollActionContext.Provider>
  );
};
