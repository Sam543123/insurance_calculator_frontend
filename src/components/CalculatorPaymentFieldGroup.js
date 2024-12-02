import React from "react";
import CalculatorField from "./CalculatorField.js";
import { inputFloatPattern } from "../utils.js";
import CalculatorFieldErrorGroup from "./CalculatorFieldErrorGroup.js";

function CalculatorPaymentFieldGroup({ insuranceLoading, technicalInterestRate, insuranceLoadingErrors, technicalInterestRateErrors, insuranceType, handleInput, addInsuranceLoadingField = true }) {
    // Render group of input calculator fields related to payments
    return (
        <React.Fragment>
            <CalculatorField labelText="Enter technical interest rate:">
                <input type="text" inputMode="decimal" pattern={inputFloatPattern} name="technicalInterestRate" value={technicalInterestRate} onChange={handleInput} />
                <CalculatorFieldErrorGroup errors={technicalInterestRateErrors} insuranceType={insuranceType} />
            </CalculatorField>
            {addInsuranceLoadingField === true && (
                <CalculatorField labelText="Enter insurance loading in %:">
                    <input type="text" inputMode="decimal" pattern={inputFloatPattern} name="insuranceLoading" value={insuranceLoading} onChange={handleInput} />
                    <CalculatorFieldErrorGroup errors={insuranceLoadingErrors} insuranceType={insuranceType} />
                </CalculatorField>
            )}

        </React.Fragment>
    )
}

export default CalculatorPaymentFieldGroup;