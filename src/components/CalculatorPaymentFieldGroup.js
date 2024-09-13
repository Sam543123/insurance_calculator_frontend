import React from "react";
import CalculatorField from "./CalculatorField.js"
import {inputFloatPattern} from "../constants.js"


function CalculatorPaymentFieldGroup({ insuranceLoading, insurancePremiumRate, insuranceLoadingErrors, insurancePremiumRateErrors, handleInput }) {
    return (
        <React.Fragment>
            <CalculatorField labelText="Enter return rate of insurance premium:">
                <input type="text" inputMode="numeric" pattern={inputFloatPattern} name="insurancePremiumRate" value={insurancePremiumRate} onChange={handleInput} />
                {insurancePremiumRateErrors && <div className="error">{insurancePremiumRateErrors.messages.map((m)=><p>{m}</p>)}</div>}
            </CalculatorField>
            <CalculatorField labelText="Enter loading:">
                <input type="text" inputMode="numeric" pattern={inputFloatPattern} name="insuranceLoading" value={insuranceLoading} onChange={handleInput} />
                {insuranceLoadingErrors && <div className="error">{insuranceLoadingErrors.messages.map((m)=><p>{m}</p>)}</div>}
            </CalculatorField>
        </React.Fragment>
    )
}

export default CalculatorPaymentFieldGroup;