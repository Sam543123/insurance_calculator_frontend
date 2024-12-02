import React from 'react';
import './App.css';
import PremiumCalculator from './components/PremiumCalculator.js';
import SumCalculator from './components/SumCalculator.js';
import ReserveCalculator from './components/ReserveCalculator.js';
import TariffsCalculator from './components/TariffsCalculator.js';
import LanguageSwitchButton from './components/LanguageSwitchButton.js';
import Select from './components/Select.js';
import { useTranslation } from "react-i18next";

function App() {
  const { t } = useTranslation();
  // Value that user wants to calculate
  // It is used to switch between different calculator forms
  const [target, setTarget] = React.useState("Insurance premium")
  // Store here calculators' inputs, errors and results to keep them when switching between different calculators
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
  const targets = ["Insurance premium", "Insurance sum", "Reserve", "Tariffs"]

  const handleChooseTarget = (e) => {
    const value = e.target.value;
    setTarget(value);
  }

  return (
    <React.Fragment>
      <LanguageSwitchButton />
      <div className="choose-value-block">
        <label>
          <h1>{t("Calculate")}</h1>
        </label>
        {/* render drop down list of target values */}
        <Select
          options={targets}
          value={target}
          onChange={handleChooseTarget}
          className="calculator-dropdown"
        />
      </div>
      {/* render one of calculator forms depending on target choosen by user */}
      {target === "Insurance premium" && (
        <PremiumCalculator
          savedInput={premiumCalculatorInput}
          savedErrors={premiumCalculatorErrors}
          savedResult={premiumCalculatorResult}
          setInput={setPremiumCalculatorInput}
          setErrors={setPremiumCalculatorErrors}
          setResult={setPremiumCalculatorResult}
        />
      )}
      {target === "Insurance sum" && (
        <SumCalculator
          savedInput={sumCalculatorInput}
          savedErrors={sumCalculatorErrors}
          savedResult={sumCalculatorResult}
          setInput={setSumCalculatorInput}
          setErrors={setSumCalculatorErrors}
          setResult={setSumCalculatorResult}
        />
      )}
      {target === "Reserve" && (
        <ReserveCalculator
          savedInput={reserveCalculatorInput}
          savedErrors={reserveCalculatorErrors}
          savedResult={reserveCalculatorResult}
          setInput={setReserveCalculatorInput}
          setErrors={setReserveCalculatorErrors}
          setResult={setReserveCalculatorResult}
        />
      )}
      {target === "Tariffs" && (
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
