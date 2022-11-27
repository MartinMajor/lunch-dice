import React from 'react';
import Diner from "./Diner";
import './App.css';
import { DinnerPricesCtx, DinnerValuesCtx } from "./Context";
import { simulation } from "./simulation";

export function App() {
    const [dinners, setDinners] = React.useState([]);
    const [dinnerPrices, setDinnerPrices] = React.useState({});
    const [dinnerValues, setDinnerValues] = React.useState({});

    const pricesCtx = React.useMemo(() => ({ values: dinnerPrices, setValues: setDinnerPrices }), [dinnerPrices]);
    const valuesCtx = React.useMemo(() => ({ values: dinnerValues, setValues: setDinnerValues }), [dinnerValues]);

    const calcValues = () => {
        const prices = Object.entries(dinnerPrices).map(([k, v]) => [k, Number(v)]).filter(([_, v]) => v > 0);


        setDinnerValues(Object.fromEntries(simulation(prices.map(([_, v]) => v)).map((v, k) => [prices[k][0], v])));
    };

    return (
        <DinnerPricesCtx.Provider value={pricesCtx}>
            <DinnerValuesCtx.Provider value={valuesCtx}>
                <div className="App">
                    <header className="header">
                        <p className="copyright">
                            <a href="https://github.com/MartinMajor/lunch-dice" target="_blank" rel="noopener noreferrer">© Martin Major</a>
                        </p>
                        <h1>Lunch dice</h1>
                    </header>
                    <div className="logo">
                        <div className="dice" />
                        <div className="plate" />
                    </div>

                    <div className="body">
                        {dinners.map((item, idx) => (
                            <div key={idx}>{item}</div>
                        ))}
                        <button onClick={() => {
                            setDinners([...dinners, <Diner idx={dinners.length} />])
                        }}>Add diner</button>
                        <button onClick={calcValues}>Calc values</button>
                    </div>
                </div>
            </DinnerValuesCtx.Provider>
        </DinnerPricesCtx.Provider>
    );
}

export default App;
