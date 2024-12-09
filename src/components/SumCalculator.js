import React from "react";
import CalculatorField from "./CalculatorField.js";
import CalculatorTraitFieldGroup from "./CalculatorTraitFieldGroup.js";
import CalculatorTimeFieldGroup from "./CalculatorTimeFieldGroup.js";
import CalculatorPaymentFieldGroup from "./CalculatorPaymentFieldGroup.js";
import CalculatorFieldErrorGroup from "./CalculatorFieldErrorGroup.js";
import CalculatorResult from "./CalculatorResult.js";
import CalculationButton from "./CalculationButton.js";
import { getBaseErrors, getCommonErrors, getCommonExcludedFields, commonHandleInput, dateFormat, requestDateFormat } from "../utils.js";
import { useToggleButton } from "../hooks.js";
import { inputFloatPattern, REACT_APP_API_URL } from "../utils.js";
import axios from "axios";
import moment from "moment";


function SumCalculator({ savedInput, savedErrors, savedResult, setInput, setErrors, setResult }) {
    // Get saved input from props or default input
    const input = savedInput || {
        insuranceType: 'pure endowment',
        insurancePremiumFrequency: 'simultaneously',
        gender: 'male',
        birthDate: '',
        insuranceStartDate: '',
        insurancePeriodYears: '',
        insurancePeriodMonths: '',
        technicalInterestRate: '',
        insuranceLoading: '',
        insurancePremium: ''
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
    const validate = (fieldName, updatedInput) => {
        let newErrors = { ...errors, [fieldName]: { fieldErrors: [], personalFieldErrors: false } };
        newErrors = getBaseErrors(fieldName, updatedInput, newErrors);
        newErrors = getCommonErrors(fieldName, updatedInput, newErrors);

        if (fieldName === "insurancePremium") {
            if (updatedInput.insurancePremium !== "" && Number(updatedInput.insurancePremium) <= 0) {
                newErrors[fieldName].fieldErrors.push({ message: "Insurance premium must be greater than 0.", excludedInsuranceTypes: [] });
                newErrors[fieldName].personalFieldErrors = true;
            }
        }

        return newErrors;
    }

    // Update calculator form when user enters data
    const handleInput = (e) => {
        commonHandleInput(e, input, validate, setInput, setErrors);
    };

    // Calculate insurance sum when "Calculate" button is pressed
    const handleSubmit = async (e) => {
        e.preventDefault();
        const routeURL = `${REACT_APP_API_URL}insurance_sum/`;
        let requestData = {
            insuranceType: input.insuranceType,
            insurancePremiumFrequency: input.insurancePremiumFrequency,
            technicalInterestRate: input.technicalInterestRate / 100,
            insuranceLoading: input.insuranceLoading / 100,
            insurancePremium: input.insurancePremium
        };

        if (input.insuranceType !== "cumulative insurance") {
            requestData.birthDate = moment(input.birthDate, dateFormat).format(requestDateFormat);
            requestData.insuranceStartDate =  moment(input.insuranceStartDate, dateFormat).format(requestDateFormat);
            requestData.gender = input.gender;
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
                    <CalculatorField labelText="Enter insurance premium:">
                        <input type="text" inputMode="decimal" pattern={inputFloatPattern} name="insurancePremium" value={input.insurancePremium} onChange={handleInput} />
                        <CalculatorFieldErrorGroup errors={errors.insurancePremium} insuranceType={input.insuranceType} />
                    </CalculatorField>
                    <CalculationButton isButtonActive={isButtonActive} />
                </form>
            </div>
            <CalculatorResult result={result} label="Insurance sum" />
        </React.Fragment>
    );
}

export default SumCalculator;