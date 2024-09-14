import React from "react";
import CalculatorField from "./CalculatorField.js"
import CalculatorTraitFieldGroup from "./CalculatorTraitFieldGroup.js"
import CalculatorTimeFieldGroup from "./CalculatorTimeFieldGroup.js"
import CalculatorPaymentFieldGroup from "./CalculatorPaymentFieldGroup.js"
import { getBaseValidationErrors, getIntermediateValidationErrors, getCommonExcludedFields } from "../utils.js"
import { inputFloatPattern, API_URL } from "../constants.js"
import axios from "axios";



function PremiumCalculator({ savedInput, savedErrors, savedResult, setInput, setErrors, setResult }) {
    const [isButtonActive, setIsButtonActive] = React.useState(false)
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
        acc[field] = { messages: [], personalFieldErrors: false };
        return acc;
    }, {})

    const result = savedResult;

    const validate = (fieldName, updatedInput) => {
        let newErrors = { ...errors, [fieldName]: { messages: [], personalFieldErrors: false } };
        newErrors = getBaseValidationErrors(fieldName, updatedInput, newErrors);
        newErrors = getIntermediateValidationErrors(fieldName, updatedInput, newErrors);

        if (fieldName === "insuranceSum") {
            if (updatedInput.insuranceSum !== "" && updatedInput.insuranceSum <= 0) {
                newErrors[fieldName].messages.push("Insurance sum must be greater than 0.");
                newErrors[fieldName].personalFieldErrors = true;
            }
        }
        setErrors(newErrors);
    }

    const handleInput = (e) => {       
        if (!e.target.validity.valid) {
            return;
        }
        const { name, value } = e.target;
        let updatedInput = { ...input, [name]: value }
        validate(name, updatedInput)
        setInput(updatedInput);       
    }

    React.useLayoutEffect(() => {
        const allFields = Object.keys(input);
        let buttonState = false;
        let excludedFields = getCommonExcludedFields(input);
        
        const trackedFields = allFields.filter((v) => !excludedFields.includes(v));   
        if (trackedFields.every((v) => input[v] !== "") && trackedFields.every((v) => errors[v].messages.length === 0)) {       
            buttonState = true;
        }
        setIsButtonActive(buttonState);
    }, [input, errors])

    const handleSubmit = async (e) => {
        e.preventDefault();
        const routeURL = `${API_URL}insurance_premium/`;
        let requestData = {
            insuranceType: input.insuranceType,
            insurancePremiumFrequency: input.insurancePremiumFrequency,
            gender: input.gender,
            insurancePremiumRate: input.insurancePremiumRate,
            insuranceLoading: input.insuranceLoading,
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
                    handleInput={handleInput}
                />
                <CalculatorField labelText="Enter insurance sum:">
                    <input type="text" inputMode="numeric" pattern={inputFloatPattern} name="insuranceSum" value={input.insuranceSum} onChange={handleInput} />
                    {errors.insuranceSum && <div className="error">{errors.insuranceSum.messages.map((m)=><p key={m}>{m}</p>)}</div>}
                </CalculatorField>
                <button type="submit" disabled={!isButtonActive} className={!isButtonActive ? "disabled" : null}>Calculate</button>
                {(result) && (
                    <div className="result-display">
                        Insurance premium={result}
                    </div>
                )}
            </form>
        </div>
    );
}

export default PremiumCalculator;