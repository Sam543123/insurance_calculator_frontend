import React from "react";
import CalculatorTraitFieldGroup from "./CalculatorTraitFieldGroup.js";
import CalculatorTimeFieldGroup from "./CalculatorTimeFieldGroup.js";
import CalculatorPaymentFieldGroup from "./CalculatorPaymentFieldGroup.js";
import PeriodFieldGroup from "./PeriodFieldGroup.js";
import CalculatorFieldErrorGroup from "./CalculatorFieldErrorGroup.js";
import { inputFloatPattern, REACT_APP_API_URL  } from "../utils.js";
import { getBaseErrors, getCommonErrors, getCommonExcludedFields, removeError, findPreviousCommonError, commonHandleInput } from "../utils.js";
import { useToggleButton } from "../hooks.js";
import axios from "axios";


function ReserveCalculator({ savedInput, savedErrors, savedResult, setInput, setErrors, setResult }) {
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
        reservePeriodYears: '',
        reservePeriodMonths: '',
        inputVariable: "insurancePremium",
        insuranceSum: '',
        insurancePremium: ''
    }
    const errors = savedErrors || Object.keys(input).reduce((acc, field) => {
        acc[field] = { fieldErrors: [], personalFieldErrors: false };
        return acc;
    }, {})
    const result = savedResult;

    const getExcludedFields = React.useCallback(() => {
        let excludedFields = getCommonExcludedFields(input);
        if (input.inputVariable === "insurancePremium") {
            excludedFields.push("insuranceSum");
        } else if (input.inputVariable === "insuranceSum") {
            excludedFields.push("insurancePremium");
        }
        return excludedFields
    }, [input])
    const isButtonActive = useToggleButton(input, errors, getExcludedFields);

    const validate = (fieldName, updatedInput) => {
        let newErrors = { ...errors, [fieldName]: { fieldErrors: [], personalFieldErrors: false } };
        let fieldsToValidate;
        let commonErrorMessage;
        let personalFieldInputCorrect;
        let previousCommonErrorField;
        newErrors = getBaseErrors(fieldName, updatedInput, newErrors);
        newErrors = getCommonErrors(fieldName, updatedInput, newErrors);

        if (fieldName === "insurancePremium") {
            if (updatedInput.insurancePremium !== "" && Number(updatedInput.insurancePremium) <= 0) {
                newErrors[fieldName].fieldErrors.push({ message: "Insurance premium must be greater than 0.", excludedInsuranceTypes: [] });
                newErrors[fieldName].personalFieldErrors = true;
            }
        } else if (fieldName === "insuranceSum") {
            if (updatedInput.insuranceSum !== "" && Number(updatedInput.insuranceSum) <= 0) {
                newErrors[fieldName].fieldErrors.push({ message: "Insurance sum must be greater than 0.", excludedInsuranceTypes: [] });
                newErrors[fieldName].personalFieldErrors = true;
            }
        }

        fieldsToValidate = fieldsToValidate = ["reservePeriodYears", "reservePeriodMonths"];
        if (fieldsToValidate.includes(fieldName)) {
            if (fieldName === "reservePeriodMonths") {
                if (updatedInput.reservePeriodMonths !== "" && updatedInput.reservePeriodMonths > 11) {
                    newErrors[fieldName].fieldErrors.push({ message: "Number of months in period from insurance start to reserve calculation must be less than 12.", excludedInsuranceTypes: [] });
                    newErrors[fieldName].personalFieldErrors = true;
                }
            }
            commonErrorMessage = "Period from insurance start to reserve calculation must be greater than 0.";
            previousCommonErrorField = findPreviousCommonError(fieldsToValidate, newErrors, commonErrorMessage);
            personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
            if (personalFieldInputCorrect) {
                if (Number(updatedInput.reservePeriodYears) === 0 && Number(updatedInput.reservePeriodMonths) === 0) {
                    if (previousCommonErrorField === null) {
                        newErrors[fieldName].fieldErrors.push({ message: commonErrorMessage, excludedInsuranceTypes: [] });
                    }
                } else {
                    removeError(previousCommonErrorField, newErrors, commonErrorMessage);
                }
            } else {
                removeError(previousCommonErrorField, newErrors, commonErrorMessage);
            }
        }

        fieldsToValidate = fieldsToValidate = ["insurancePeriodYears", "insurancePeriodMonths", "reservePeriodYears", "reservePeriodMonths"];
        if (fieldsToValidate.includes(fieldName)) {
            commonErrorMessage = "Period from insurance start to reserve calculation must be less than insurance period.";
            previousCommonErrorField = findPreviousCommonError(fieldsToValidate, newErrors, commonErrorMessage);
            personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
            if (personalFieldInputCorrect) {
                if ((12 * Number(updatedInput.reservePeriodYears) + Number(updatedInput.reservePeriodMonths)) >= (12 * Number(updatedInput.insurancePeriodYears) + Number(updatedInput.insurancePeriodMonths))) {
                    if (previousCommonErrorField === null) {
                        newErrors[fieldName].fieldErrors.push({ message: commonErrorMessage, excludedInsuranceTypes: ["whole life insurance"] });
                    }
                } else {
                    removeError(previousCommonErrorField, newErrors, commonErrorMessage);
                }
            } else {
                removeError(previousCommonErrorField, newErrors, commonErrorMessage);
            }
        }
        return newErrors;
    }
   
    const handleInput = (e) => {
        commonHandleInput(e, input, validate, setInput, setErrors);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const routeURL = `${REACT_APP_API_URL }reserve/`;
        let requestData = {
            insuranceType: input.insuranceType,
            insurancePremiumFrequency: input.insurancePremiumFrequency,
            gender: input.gender,
            insurancePremiumRate: input.insurancePremiumRate,
            insuranceLoading: input.insuranceLoading
        };

        if (input.insuranceType !== "cumulative insurance") {
            requestData.birthDate = input.birthDate;
            requestData.insuranceStartDate = input.insuranceStartDate;
        }

        if (input.insuranceType !== "whole life insurance") {
            requestData.insurancePeriod = 12 * Number(input.insurancePeriodYears) + Number(input.insurancePeriodMonths);
        }

        if (input.inputVariable === "insurancePremium") {
            requestData.insurancePremium = input.insurancePremium;
        } else {
            requestData.insuranceSum = input.insuranceSum;
        }

        requestData.reserveCalculationPeriod = 12 * Number(input.reservePeriodYears) + Number(input.reservePeriodMonths);

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
                <div className="field-block">
                    <input
                        type="radio"
                        name="inputVariable"
                        value="insurancePremium"
                        checked={input.inputVariable === "insurancePremium"}
                        onChange={handleInput}
                    />
                    <label>Enter insurance premium:</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern={inputFloatPattern}
                        name="insurancePremium"
                        value={input.insurancePremium}
                        onChange={handleInput}
                        disabled={input.inputVariable !== "insurancePremium"}
                    />
                    <CalculatorFieldErrorGroup errors={errors.insurancePremium} insuranceType={input.insuranceType} />                  
                </div>
                <div className="field-block">
                    <input
                        type="radio"
                        name="inputVariable"
                        value="insuranceSum"
                        checked={input.inputVariable === "insuranceSum"}
                        onChange={handleInput}
                    />
                    <label>Enter insurance sum:</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern={inputFloatPattern}
                        name="insuranceSum"
                        value={input.insuranceSum}
                        onChange={handleInput}
                        disabled={input.inputVariable !== "insuranceSum"}
                    />
                    <CalculatorFieldErrorGroup errors={errors.insuranceSum} insuranceType={input.insuranceType} />
                </div>
                <PeriodFieldGroup
                    labelText="Enter time from insurance start to reserve calculation:"
                    yearsFieldName="reservePeriodYears"
                    monthsFieldName="reservePeriodMonths"
                    yearsField={input.reservePeriodYears}
                    monthsField={input.reservePeriodMonths}
                    yearsFieldErrors={errors.reservePeriodYears}
                    monthsFieldErrors={errors.reservePeriodMonths}
                    insuranceType={input.insuranceType}
                    handleInput={handleInput}
                />
                <button type="submit" disabled={!isButtonActive} className={!isButtonActive ? "disabled" : null}>Calculate</button>
                {result !== null && (
                    <div className="result-display">
                        Reserve={result}
                    </div>
                )}
            </form>
        </div>
    );
}

export default ReserveCalculator;