import React from 'react';
import './App.css';
import Calculator from './components/Calculator.js';


class App extends React.Component {
  state = {
    target: "insurancePremium",
  };

  // TODO code duplication
  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value
    });
  };

  render() {
    const targetsDictionary = {insurancePremium: "Страховой взнос", insuranceSum: "Страховую сумму"};
    return (
      <React.Fragment>
        <div className="choose-value-block">
          <label>
            <h1>Рассчитать</h1>
          </label>
          <select className="calculator-dropdown" name="target" selected={this.state.target} onChange={this.handleChange}>
            {Object.entries(targetsDictionary).map(([target, optionLabel]) => (
              <option key={target} value={target}>
                {optionLabel}
              </option>
            ))}
          </select>
        </div>
        <Calculator target={this.state.target} />
      </React.Fragment>
    );
  }
}

export default App;
