import * as ReactDOM from 'react-dom';

// Modern API for view transitions. Remove this when API is stable.
declare global {
  interface Document {
    startViewTransition:
      | undefined
      | ((updateCallback: () => Promise<void> | void) => ViewTransition);
  }

  interface ViewTransition {
    finished: Promise<void>;
    ready: Promise<void>;
    updateCallbackDone: Promise<void>;
    skipTransition(): void;
  }

  interface CSSStyleDeclaration {
    viewTransitionName?: string;
  }
}

export function useViewTransition() {
  return (callback: () => void | Promise<void>) => {
    if (typeof document.startViewTransition === 'function') {
      document.startViewTransition(() => ReactDOM.flushSync(() => callback()));
    } else {
      callback();
    }
  };
}
