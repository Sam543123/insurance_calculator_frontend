import React from "react";
import CalculatorTraitFieldGroup from "./CalculatorTraitFieldGroup.js";
import CalculatorTimeFieldGroup from "./CalculatorTimeFieldGroup.js";
import CalculatorPaymentFieldGroup from "./CalculatorPaymentFieldGroup.js";
import PeriodFieldGroup from "./PeriodFieldGroup.js";
import CalculatorFieldErrorGroup from "./CalculatorFieldErrorGroup.js";
import CalculatorResult from "./CalculatorResult.js";
import CalculationButton from "./CalculationButton.js";
import { calculate, getCommonRequestData, inputFloatPattern, REACT_APP_API_URL } from "../utils.js";
import { getCommonErrors, getCommonExcludedFields, removeError, findPreviousCommonError, commonHandleInput } from "../utils.js";
import { useToggleButton } from "../hooks.js";
import { useTranslation } from "react-i18next";


function ReserveCalculator({ savedInput, savedErrors, savedResult, setInput, setErrors, setResult }) {
    const { t } = useTranslation();
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
        reservePeriodYears: "",
        reservePeriodMonths: "",
        inputVariable: "insurancePremium",
        insuranceSum: "",
        insurancePremium: ""
    }
    // Get saved errors from props or empty error dictionary
    const errors = savedErrors || Object.keys(input).reduce((acc, field) => {
        acc[field] = { fieldErrors: [], personalFieldErrors: false };
        return acc;
    }, {})
    // Get saved result from props
    const result = savedResult;

    // get fields that are excluded when determining whether "Calculate" button is active
    const getExcludedFields = React.useCallback((inputData) => {
        let excludedFields = getCommonExcludedFields(inputData);
        if (inputData.inputVariable === "insurancePremium") {
            excludedFields.push("insuranceSum");
        } else if (inputData.inputVariable === "insuranceSum") {
            excludedFields.push("insurancePremium", "insuranceLoading");
        }
        return excludedFields
    }, [])

    // State variable that indicates if "Calculate" button is active
    // "Calculate" button is active if all fields are filled and there are no input errors
    const isButtonActive = useToggleButton(input, errors, getExcludedFields);

    // validate calculator input
    const validate = (fieldName, updatedInput, currentErrors) => {     
        let fieldsToValidate;
        let commonErrorMessage;
        let personalFieldInputCorrect;
        let previousCommonErrorField;
        let updatedErrors = getCommonErrors(fieldName, updatedInput, currentErrors);

        if (fieldName === "insurancePremium") {
            if (updatedInput.insurancePremium !== "" && Number(updatedInput.insurancePremium) <= 0) {
                updatedErrors[fieldName].fieldErrors.push({ message: "Insurance premium must be greater than 0.", excludedInsuranceTypes: [] });
                updatedErrors[fieldName].personalFieldErrors = true;
            }
        } else if (fieldName === "insuranceSum") {
            if (updatedInput.insuranceSum !== "" && Number(updatedInput.insuranceSum) <= 0) {
                updatedErrors[fieldName].fieldErrors.push({ message: "Insurance sum must be greater than 0.", excludedInsuranceTypes: [] });
                updatedErrors[fieldName].personalFieldErrors = true;
            }
        }

        fieldsToValidate = fieldsToValidate = ["reservePeriodYears", "reservePeriodMonths"];
        if (fieldsToValidate.includes(fieldName)) {
            if (fieldName === "reservePeriodMonths") {
                if (updatedInput.reservePeriodMonths !== "" && updatedInput.reservePeriodMonths > 11) {
                    updatedErrors[fieldName].fieldErrors.push({ message: "Number of months in period from insurance start to reserve calculation must be less than 12.", excludedInsuranceTypes: [] });
                    updatedErrors[fieldName].personalFieldErrors = true;
                }
            }
            commonErrorMessage = "Period from insurance start to reserve calculation must be greater than 0.";
            previousCommonErrorField = findPreviousCommonError(fieldsToValidate, updatedErrors, commonErrorMessage);
            personalFieldInputCorrect = fieldsToValidate.every((f) => updatedErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
            if (personalFieldInputCorrect) {
                if (Number(updatedInput.reservePeriodYears) === 0 && Number(updatedInput.reservePeriodMonths) === 0) {
                    if (previousCommonErrorField === null) {
                        updatedErrors[fieldName].fieldErrors.push({ message: commonErrorMessage, excludedInsuranceTypes: [] });
                    }
                } else {
                    removeError(previousCommonErrorField, updatedErrors, commonErrorMessage);
                }
            } else {
                removeError(previousCommonErrorField, updatedErrors, commonErrorMessage);
            }
        }

        fieldsToValidate = fieldsToValidate = ["insurancePeriodYears", "insurancePeriodMonths", "reservePeriodYears", "reservePeriodMonths"];
        if (fieldsToValidate.includes(fieldName)) {
            commonErrorMessage = "Period from insurance start to reserve calculation must be less than insurance period.";
            previousCommonErrorField = findPreviousCommonError(fieldsToValidate, updatedErrors, commonErrorMessage);
            personalFieldInputCorrect = fieldsToValidate.every((f) => updatedErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
            if (personalFieldInputCorrect) {
                if ((12 * Number(updatedInput.reservePeriodYears) + Number(updatedInput.reservePeriodMonths)) >= (12 * Number(updatedInput.insurancePeriodYears) + Number(updatedInput.insurancePeriodMonths))) {
                    if (previousCommonErrorField === null) {
                        updatedErrors[fieldName].fieldErrors.push({ message: commonErrorMessage, excludedInsuranceTypes: ["whole life insurance"] });
                    }
                } else {
                    removeError(previousCommonErrorField, updatedErrors, commonErrorMessage);
                }
            } else {
                removeError(previousCommonErrorField, updatedErrors, commonErrorMessage);
            }
        }
        return updatedErrors;
    }

    // Update calculator form when user enters data
    const handleInput = (event) => {
        commonHandleInput(event, input, errors, setInput, setErrors, validate);
    };

    // Calculate reserve when "Calculate" button is pressed
    const handleSubmit = async (event) => {
        event.preventDefault();
        const routeURL = `${REACT_APP_API_URL}reserve/`;
        let requestData = getCommonRequestData(input);
        if (input.inputVariable === "insurancePremium") {
            requestData.insurancePremium = input.insurancePremium;
            requestData.insuranceLoading = input.insuranceLoading / 100;
        } else {
            requestData.insuranceSum = input.insuranceSum;
        }

        requestData.reserveCalculationPeriod = 12 * Number(input.reservePeriodYears) + Number(input.reservePeriodMonths);

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
                        addInsuranceLoadingField={input.inputVariable === "insurancePremium"}
                    />
                    {/* Choose to calculate reserve using insurance premium or insurance sum */}
                    <div className="field-block">
                        <div>
                            <input
                                type="radio"
                                name="inputVariable"
                                value="insurancePremium"
                                checked={input.inputVariable === "insurancePremium"}
                                onChange={handleInput}
                            />
                            <label>{t("Enter insurance premium:")}</label>
                        </div>
                        <input
                            type="text"
                            inputMode="decimal"
                            pattern={inputFloatPattern}
                            name="insurancePremium"
                            value={input.insurancePremium}
                            onChange={handleInput}
                            disabled={input.inputVariable !== "insurancePremium"}
                        />
                        <CalculatorFieldErrorGroup errors={errors.insurancePremium} insuranceType={input.insuranceType} />
                    </div>
                    <div className="field-block">
                        <div>
                            <input
                                type="radio"
                                name="inputVariable"
                                value="insuranceSum"
                                checked={input.inputVariable === "insuranceSum"}
                                onChange={handleInput}
                            />
                            <label>{t("Enter insurance sum:")}</label>
                        </div>
                        <input
                            type="text"
                            inputMode="decimal"
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
                    <CalculationButton isButtonActive={isButtonActive} />
                </form>
            </div>
            <CalculatorResult result={result} label="Reserve" />
        </React.Fragment>
    );
}

export default ReserveCalculator;