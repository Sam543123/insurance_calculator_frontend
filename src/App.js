import React from 'react';
import './App.css';
import BaseCalculator from './components/Calculator.js';


class App extends React.Component {

  constructor(props) {
    super(props);
    const baseCalculatorState = {
      insuranceType: 'чистое дожитие',
      insurancePremiumFrequency: 'единовременно',
      gender: 'мужской',
      insurancePremiumRate: '',
      insuranceLoading: '',    
      result: null
    }

    const intermediateCalculatorState = {
      ...baseCalculatorState,
      birthDate: '',
      insuranceStartDate: '',
      insurancePeriodYears: '',
      insurancePeriodMonths: '',          
      result: null
    }
    this.state = {
      target: "insurancePremium"
    };
    this.calculatorStoredState = {
      insurancePremium: {
        insuranceSum: '',
        ...intermediateCalculatorState
      },
      insuranceSum: {
        insurancePremium: '',
        ...intermediateCalculatorState
      },
      reserve: {
        reservPeriodYears: '',
        reservPeriodMonths: '',
        ...intermediateCalculatorState
      },
      tariffs: {
        insuranceStartAge: '',
        insuranceEndAge: '',
        maximumInsurancePeriod: '',
        ...baseCalculatorState
      }
    }
  }

  // TODO code duplication
  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value
    });
  };

  updateCalculatorState = (name, value) => {
    this.calculatorStoredState[this.state.target][name] = value;
  }

  render() {
    const targetsDictionary = { insurancePremium: "Страховой взнос", insuranceSum: "Страховую сумму", reserve: "Резерв", tariffs: "Тарифы" };
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
        {/* key field is necessary to rerender new component after changing target. */}
        <BaseCalculator key={this.state.target}
          target={this.state.target}
          storedState={this.calculatorStoredState[this.state.target]}
          updateStoredState={this.updateCalculatorState} />
      </React.Fragment>
    );
  }
}

export default App;
