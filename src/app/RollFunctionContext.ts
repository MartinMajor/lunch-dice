import { createContext } from 'react';

import fetchWithTimeout from "./fetchWithTimeout";

export const onlineRollFunction = () => {
    return fetchWithTimeout("https://www.random.org/integers//?num=1&min=1&max=10000&col=1&base=10&format=plain&rnd=new", { timeout: 10000 })
        .then(value => value.text())
        .then(text => parseInt(text))
}

export const offlineRollFunction = () => {
    return Promise.resolve(Math.floor(Math.random() * 10000) + 1);
}

export const RollFunctionContext = createContext(onlineRollFunction);
