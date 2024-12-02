import React from "react";
import CalculatorField from "./CalculatorField.js";
import Select from "./Select.js";


function CalculatorTraitFieldGroup({ insuranceType, insurancePremiumFrequency, gender, handleInput }) {
    // Render group of start input calculator fields   
    const insuranceTypes = ["pure endowment", "term life insurance", "whole life insurance", "cumulative insurance"];
    const insurancePremiumFrequencyChoices = ["simultaneously", "annually", "monthly"];
    const genders = ["male", "female"];
    return (
        <React.Fragment>
            <CalculatorField labelText="Choose insurance type:">
                <Select
                    options={insuranceTypes}
                    value={insuranceType}
                    onChange={handleInput}
                    name="insuranceType"
                />
            </CalculatorField>
            <CalculatorField labelText="Choose insurance premium payment frequency:">
                <Select
                    options={insurancePremiumFrequencyChoices}
                    value={insurancePremiumFrequency}
                    onChange={handleInput}
                    name="insurancePremiumFrequency"
                />
            </CalculatorField>
            {insuranceType !== "cumulative insurance" && (
                < CalculatorField labelText="Choose gender of insured person:">
                    <Select
                        options={genders}
                        value={gender}
                        onChange={handleInput}
                        name="gender"
                    />
                </CalculatorField>
            )}
        </React.Fragment >
    )
}

export default CalculatorTraitFieldGroup;