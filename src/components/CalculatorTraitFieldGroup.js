import React from "react";
import CalculatorField from "./CalculatorField.js"


function CalculatorTraitFieldGroup({ insuranceType, insurancePremiumFrequency, gender, handleInput }) {
    return (
        <React.Fragment>
            <CalculatorField labelText="Choose insurance type:">
                <select name="insuranceType" value={insuranceType} onChange={handleInput}>
                    <option>pure endowment</option>
                    <option>term life insurance</option>
                    <option>whole life insurance</option>
                    <option>cumulative insurance</option>
                </select>
            </CalculatorField>
            <CalculatorField labelText="Choose payment frequency:">
                <select name="insurancePremiumFrequency" value={insurancePremiumFrequency} onChange={handleInput}>
                    <option>simultaneously</option>
                    <option>annually</option>
                    <option>monthly</option>
                </select>
            </CalculatorField>
            <CalculatorField labelText="Choose gender of the insured person:">
                <select name="gender" value={gender} onChange={handleInput}>
                    <option>male</option>
                    <option>female</option>
                </select>
            </CalculatorField>
        </React.Fragment>
    )
}

export default CalculatorTraitFieldGroup;