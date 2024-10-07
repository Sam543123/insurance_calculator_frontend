import React from "react";
import CalculatorField from "./CalculatorField.js";
import { inputFloatPattern } from "../utils.js";
import CalculatorFieldErrorGroup from "./CalculatorFieldErrorGroup.js";


function CalculatorPaymentFieldGroup({ insuranceLoading, insurancePremiumRate, insuranceLoadingErrors, insurancePremiumRateErrors, insuranceType, handleInput }) {
    return (
        <React.Fragment>
            <CalculatorField labelText="Enter return rate of insurance premium:">
                <input type="text" inputMode="numeric" pattern={inputFloatPattern} name="insurancePremiumRate" value={insurancePremiumRate} onChange={handleInput} />
                <CalculatorFieldErrorGroup errors={insurancePremiumRateErrors} insuranceType={insuranceType}/>                
            </CalculatorField>
            <CalculatorField labelText="Enter loading:">
                <input type="text" inputMode="numeric" pattern={inputFloatPattern} name="insuranceLoading" value={insuranceLoading} onChange={handleInput} />
                <CalculatorFieldErrorGroup errors={insuranceLoadingErrors} insuranceType={insuranceType}/>                
            </CalculatorField>
        </React.Fragment>
    )
}

export default CalculatorPaymentFieldGroup;