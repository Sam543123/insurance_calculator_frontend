import React from "react";
import CalculatorField from "./CalculatorField.js"
import {inputFloatPattern} from "../constants.js"


function CalculatorStartFieldGroup({ insuranceLoading, insurancePremiumRate, insuranceLoadingError, insurancePremiumRateError, handleInput }) {
    return (
        <React.Fragment>
            <CalculatorField labelText="Enter return rate of insurance premium:">
                <input type="text" inputMode="numeric" pattern={inputFloatPattern} name="insurancePremiumRate" value={insurancePremiumRate} onChange={handleInpute} />
                {insurancePremiumRateError && <div className="error">{insurancePremiumRateError}</div>}
            </CalculatorField>
            <CalculatorField labelText="Enter loading:">
                <input type="text" inputMode="numeric" pattern={inputFloatPattern} name="insuranceLoading" value={insuranceLoading} onChange={handleInput} />
                {insuranceLoadingError&& <div className="error">{insuranceLoadingError}</div>}
            </CalculatorField>
        </React.Fragment>
    )
}

export default CalculatorStartFieldGroup;