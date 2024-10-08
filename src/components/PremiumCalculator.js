import React from "react";
import CalculatorField from "./CalculatorField.js";
import CalculatorTraitFieldGroup from "./CalculatorTraitFieldGroup.js";
import CalculatorTimeFieldGroup from "./CalculatorTimeFieldGroup.js";
import CalculatorPaymentFieldGroup from "./CalculatorPaymentFieldGroup.js";
import CalculatorFieldErrorGroup from "./CalculatorFieldErrorGroup.js";
import { getBaseErrors, getCommonErrors, getCommonExcludedFields, commonHandleInput } from "../utils.js";
import { useToggleButton } from "../hooks.js";
import { inputFloatPattern, REACT_APP_API_URL  } from "../utils.js";
import axios from "axios";

function PremiumCalculator({ savedInput, savedErrors, savedResult, setInput, setErrors, setResult }) {

    const input = savedInput || {
        insuranceType: 'pure endowment',
        insurancePremiumFrequency: 'simultaneously',
        gender: 'male',
        birthDate: '',
        insuranceStartDate: '',
        insurancePeriodYears: '',
        insurancePeriodMonths: '',
        insurancePremiumRate: '',
        insuranceLoading: '',
        insuranceSum: ''
    }
    const errors = savedErrors || Object.keys(input).reduce((acc, field) => {
        acc[field] = { fieldErrors: [], personalFieldErrors: false };
        return acc;
    }, {})
    const isButtonActive = useToggleButton(input, errors, getCommonExcludedFields);

    const result = savedResult;

    const validate = (fieldName, updatedInput) => {
        let newErrors = { ...errors, [fieldName]: { fieldErrors: [], personalFieldErrors: false } };
        newErrors = getBaseErrors(fieldName, updatedInput, newErrors);
        newErrors = getCommonErrors(fieldName, updatedInput, newErrors);

        if (fieldName === "insuranceSum") {
            if (updatedInput.insuranceSum !== "" && Number(updatedInput.insuranceSum) <= 0) {
                newErrors[fieldName].fieldErrors.push({ message: "Insurance sum must be greater than 0.", excludedInsuranceTypes: [] });
                newErrors[fieldName].personalFieldErrors = true;
            }
        }
        return newErrors;
    }


    const handleInput = (e) => {
        commonHandleInput(e, input, validate, setInput, setErrors);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const routeURL = `${REACT_APP_API_URL }insurance_premium/`;
        let requestData = {
            insuranceType: input.insuranceType,
            insurancePremiumFrequency: input.insurancePremiumFrequency,
            gender: input.gender,
            insurancePremiumRate: input.insurancePremiumRate / 100,
            insuranceLoading: input.insuranceLoading / 100,
            insuranceSum: input.insuranceSum
        };

        if (input.insuranceType !== "cumulative insurance") {
            requestData.birthDate = input.birthDate;
            requestData.insuranceStartDate = input.insuranceStartDate;
        }

        if (input.insuranceType !== "whole life insurance") {
            requestData.insurancePeriod = 12 * Number(input.insurancePeriodYears) + Number(input.insurancePeriodMonths);
        }

        try {
            const response = await axios.post(routeURL, requestData);
            setResult(response.data.result)
        } catch (error) {
            console.error(`Error while sending request to ${routeURL}`, error);
        }
    }

    return (
        <div className="App">
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
                    insurancePremiumRate={input.insurancePremiumRate}
                    insuranceLoading={input.insuranceLoading}
                    insurancePremiumRateErrors={errors.insurancePremiumRate}
                    insuranceLoadingErrors={errors.insuranceLoading}
                    insuranceType={input.insuranceType}
                    handleInput={handleInput}
                />
                <CalculatorField labelText="Enter insurance sum:">
                    <input type="text" inputMode="numeric" pattern={inputFloatPattern} name="insuranceSum" value={input.insuranceSum} onChange={handleInput} />
                    <CalculatorFieldErrorGroup errors={errors.insuranceSum} insuranceType={input.insuranceType} />
                </CalculatorField>
                <button type="submit" disabled={!isButtonActive} className={!isButtonActive ? "disabled" : null}>Calculate</button>
                {result !== null && (
                    <div className="result-display">
                        Insurance premium={result}
                    </div>
                )}
            </form>
        </div>
    );
}

export default PremiumCalculator;