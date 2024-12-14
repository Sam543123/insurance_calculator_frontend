import React from "react";
import CalculatorField from "./CalculatorField.js";
import CalculatorTraitFieldGroup from "./CalculatorTraitFieldGroup.js";
import CalculatorTimeFieldGroup from "./CalculatorTimeFieldGroup.js";
import CalculatorPaymentFieldGroup from "./CalculatorPaymentFieldGroup.js";
import CalculatorFieldErrorGroup from "./CalculatorFieldErrorGroup.js";
import CalculatorResult from "./CalculatorResult.js";
import CalculationButton from "./CalculationButton.js";
import { getCommonErrors, getCommonExcludedFields, commonHandleInput, getCommonRequestData, calculate } from "../utils.js";
import { useToggleButton } from "../hooks.js";
import { inputFloatPattern, REACT_APP_API_URL } from "../utils.js";


function PremiumCalculator({ savedInput, savedErrors, savedResult, setInput, setErrors, setResult }) {
    // Get saved input from props or default input
    const input = savedInput || {
        insuranceType: "pure endowment",
        insurancePremiumFrequency: "simultaneously",
        gender: "male",
        birthDate: "",
        insuranceStartDate: "",
        insurancePeriodYears: "",
        insurancePeriodMonths: "",
        technicalInterestRate: "",
        insuranceLoading: "",
        insuranceSum: ""
    }
    // Get saved errors from props or empty error dictionary
    const errors = savedErrors || Object.keys(input).reduce((acc, field) => {
        acc[field] = { fieldErrors: [], personalFieldErrors: false };
        return acc;
    }, {})
    // Get saved result from props
    const result = savedResult;
    // State variable that indicates if "Calculate" button is active
    // "Calculate" button is active if all fields are filled and there are no input errors
    const isButtonActive = useToggleButton(input, errors, getCommonExcludedFields);

    // validate calculator input
    const validate = (fieldName, updatedInput, currentErrors) => {
        let updatedErrors = getCommonErrors(fieldName, updatedInput, currentErrors);

        if (fieldName === "insuranceSum") {
            if (updatedInput.insuranceSum !== "" && Number(updatedInput.insuranceSum) <= 0) {
                updatedErrors[fieldName].fieldErrors.push({ message: "Insurance sum must be greater than 0.", excludedInsuranceTypes: [] });
                updatedErrors[fieldName].personalFieldErrors = true;
            }
        }
        return updatedErrors;
    }

    // Update calculator form when user enters data
    const handleInput = (event) => {
        commonHandleInput(event, input, errors, setInput, setErrors, validate);
    };

    // Calculate insurance premium when "Calculate" button is pressed
    const handleSubmit = async (event) => {
        event.preventDefault();
        const routeURL = `${REACT_APP_API_URL}insurance-premium/`;
        let requestData = getCommonRequestData(input);
        requestData.insuranceLoading = input.insuranceLoading / 100;
        requestData.insuranceSum = input.insuranceSum;

        await calculate(requestData, setResult, routeURL);
    }

    return (
        <React.Fragment>
            <div className="calculator-form">
                <form onSubmit={handleSubmit} noValidate>
                    <CalculatorTraitFieldGroup
                        insuranceType={input.insuranceType}
                        insurancePremiumFrequency={input.insurancePremiumFrequency}
                        gender={input.gender}
                        handleInput={handleInput}
                    />
                    <CalculatorTimeFieldGroup
                        insuranceType={input.insuranceType}
                        birthDate={input.birthDate}
                        insuranceStartDate={input.insuranceStartDate}
                        insurancePeriodYears={input.insurancePeriodYears}
                        insurancePeriodMonths={input.insurancePeriodMonths}
                        birthDateErrors={errors.birthDate}
                        insuranceStartDateErrors={errors.insuranceStartDate}
                        insurancePeriodYearsErrors={errors.insurancePeriodYears}
                        insurancePeriodMonthsErrors={errors.insurancePeriodMonths}
                        handleInput={handleInput}
                    />
                    <CalculatorPaymentFieldGroup
                        technicalInterestRate={input.technicalInterestRate}
                        insuranceLoading={input.insuranceLoading}
                        technicalInterestRateErrors={errors.technicalInterestRate}
                        insuranceLoadingErrors={errors.insuranceLoading}
                        insuranceType={input.insuranceType}
                        handleInput={handleInput}
                    />
                    <CalculatorField labelText="Enter insurance sum:">
                        <input type="text" inputMode="decimal" pattern={inputFloatPattern} name="insuranceSum" value={input.insuranceSum} onChange={handleInput} />
                        <CalculatorFieldErrorGroup errors={errors.insuranceSum} insuranceType={input.insuranceType} />
                    </CalculatorField>
                    <CalculationButton isButtonActive={isButtonActive} />
                </form>
            </div>
            <CalculatorResult result={result} label="Insurance premium" />
        </React.Fragment>
    );
}

export default PremiumCalculator;