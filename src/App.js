import React from 'react';
import Diner from "./Diner";
import './App.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            diners: [],
        };
    }

    render() {
        return (
            <div className="App">
                <header className="header">
                    <p className="copyright">
                        <a href="https://github.com/MartinMajor/lunch-dice" target="_blank" rel="noopener noreferrer">© Martin Major</a>
                    </p>
                    <h1>Lunch dice</h1>
                </header>
                <div className="logo">
                    <div className="dice"/>
                    <div className="plate"/>
                </div>

                <div className="body">
                    {this.state.diners.map((item, idx) => (
                        <div key={idx}>{item}</div>
                    ))}
                    <button onClick={() => {
                        this.setState({
                            diners: [...this.state.diners, <Diner idx={this.state.diners.length} />]
                        })
                    }}>Add diner</button>
                </div>
            </div>
        )
    }
}

export default App;
