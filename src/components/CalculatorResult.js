import React from 'react';

function CalculatorResult({ label, result }) {
  return (
    <div className="calculator-result">       
        <p>{label}={result || "?"}</p>       
    </div>
  );
}

export default CalculatorResult;