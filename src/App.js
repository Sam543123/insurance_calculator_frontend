import React from 'react';
import './App.css';
import PremiumCalculator from './components/PremiumCalculator.js';
import SumCalculator from './components/SumCalculator.js';
import ReserveCalculator from './components/ReserveCalculator.js';
import TariffsCalculator from './components/TariffsCalculator.js';

function App() {
  const [target, setTarget] = React.useState("insurancePremium")
  const [premiumCalculatorInput, setPremiumCalculatorInput] = React.useState(null);
  const [sumCalculatorInput, setSumCalculatorInput] = React.useState(null);
  const [reserveCalculatorInput, setReserveCalculatorInput] = React.useState(null);
  const [tariffsCalculatorInput, setTariffsCalculatorInput] = React.useState(null);
  const [premiumCalculatorErrors, setPremiumCalculatorErrors] = React.useState(null);
  const [sumCalculatorErrors, setSumCalculatorErrors] = React.useState(null);
  const [reserveCalculatorErrors, setReserveCalculatorErrors] = React.useState(null);
  const [tariffsCalculatorErrors, setTariffsCalculatorErrors] = React.useState(null);
  const [premiumCalculatorResult, setPremiumCalculatorResult] = React.useState(null);
  const [sumCalculatorResult, setSumCalculatorResult] = React.useState(null);
  const [reserveCalculatorResult, setReserveCalculatorResult] = React.useState(null);
  const targetsDictionary = { insurancePremium: "Insurance premium", insuranceSum: "Insurance sum", reserve: "Reserve", tariffs: "Tariffs" };
  const handleChooseTarget = (e) => {
    const value = e.target.value;
    setTarget(value);
  }

  return (
    <React.Fragment>
      <div className="choose-value-block">
        <label>
          <h1>Calculate</h1>
        </label>
        <select className="calculator-dropdown" selected={target} onChange={handleChooseTarget}>
          {Object.entries(targetsDictionary).map(([target, optionLabel]) => (
            <option key={target} value={target}>
              {optionLabel}
            </option>
          ))}
        </select>
      </div>
      {target === "insurancePremium" && (
        <PremiumCalculator
          savedInput={premiumCalculatorInput}
          savedErrors={premiumCalculatorErrors}
          savedResult={premiumCalculatorResult}
          setInput={setPremiumCalculatorInput}
          setErrors={setPremiumCalculatorErrors}
          setResult={setPremiumCalculatorResult}
        />
      )}
      {target === "insuranceSum" && (
        <SumCalculator
          savedInput={sumCalculatorInput}
          savedErrors={sumCalculatorErrors}
          savedResult={sumCalculatorResult}
          setInput={setSumCalculatorInput}
          setErrors={setSumCalculatorErrors}
          setResult={setSumCalculatorResult}
        />
      )}
      {target === "reserve" && (
        <ReserveCalculator
          savedInput={reserveCalculatorInput}
          savedErrors={reserveCalculatorErrors}
          savedResult={reserveCalculatorResult}
          setInput={setReserveCalculatorInput}
          setErrors={setReserveCalculatorErrors}
          setResult={setReserveCalculatorResult}
        />
      )}
      {target === "tariffs" && (
        <TariffsCalculator
          savedInput={tariffsCalculatorInput}
          savedErrors={tariffsCalculatorErrors}
          setInput={setTariffsCalculatorInput}
          setErrors={setTariffsCalculatorErrors}
        />
      )}
    </React.Fragment>
  );
}

export default App;
