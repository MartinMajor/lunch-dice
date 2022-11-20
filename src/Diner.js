import React from 'react';
import { DinnerPricesCtx, DinnerValuesCtx } from "./Context";
import './Diner.css';

console.log(DinnerPricesCtx, DinnerValuesCtx);


export function Diner(props) {
    const pricesCtx = React.useContext(DinnerPricesCtx);
    const valuesCtx = React.useContext(DinnerValuesCtx);
    const [guestRandomNumber, setGuestRandomNumber] = React.useState(null);
    const dinnerPrice = pricesCtx.values[props.idx] ?? "";
    const dinnerValue = valuesCtx.values[props.idx] ?? null;

    return (
        <div className="diner">
            <label htmlFor={"number" + props.idx}>Price</label>
            <input value={dinnerPrice} className="price" type="number" id={"number" + props.idx} onChange={event => pricesCtx.setValues({ ...pricesCtx.values, [props.idx]: event.currentTarget.value })} />
            value: {dinnerValue ? Math.round(dinnerValue) : "- "}
            <button className="roll" disabled={!dinnerValue} onClick={() =>
                fetch("https://www.random.org/integers//?num=1&min=1&max=10000&col=1&base=10&format=plain&rnd=new")
                    .then((value) => value.text())
                    .then(setGuestRandomNumber)
            }>Roll

            </button>
            <br />
            Rolled: <span>{guestRandomNumber ? guestRandomNumber : '?'}</span>, normalized: <b>{guestRandomNumber ? Math.round(guestRandomNumber / dinnerValue * 100) / 100 : '?'}</b>
        </div>

    );
}


export default Diner;
