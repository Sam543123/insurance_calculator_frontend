import React from 'react';
import { useTranslation } from "react-i18next";

function CalculatorResult({ label, result }) {
  const { t } = useTranslation();
  return (
    <div className="calculator-result">       
        <p>{t(label)}={result || "?"}</p>       
    </div>
  );
}

export default CalculatorResult;