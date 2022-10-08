import React from 'react';
import './Diner.css';

class Diner extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            number: null,
            price: null
        };
    }

    render() {
        return (
            <div className="diner">
                <label htmlFor={"number" + this.props.idx}>Price</label>
                <input className="price" type="number" id={"number" + this.props.idx} onChange={event =>this.setState({price: event.target.value})} />
                <button className="roll" disabled={!this.state.price} onClick={() =>
                    fetch("https://www.random.org/integers//?num=1&min=1&max=10000&col=1&base=10&format=plain&rnd=new")
                        .then((value) => value.text())
                        .then((number) => this.setState({
                            number: Number(number)
                        }))
                }>Roll
                </button>
                <br />
                Rolled: <span>{this.state.number ? this.state.number : '?'}</span>, normalized: <b>{this.state.number ? Math.round(this.state.number / this.state.price * 100) / 100 : '?'}</b>
            </div>
        );
    }
}

export default Diner;
