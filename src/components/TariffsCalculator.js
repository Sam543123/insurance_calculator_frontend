import React from "react";
import CalculatorField from "./CalculatorField.js";
import CalculatorTraitFieldGroup from "./CalculatorTraitFieldGroup.js";
import CalculatorPaymentFieldGroup from "./CalculatorPaymentFieldGroup.js";
import PeriodFieldGroup from "./PeriodFieldGroup.js";
import CalculatorFieldErrorGroup from "./CalculatorFieldErrorGroup.js";
import CalculationButton from "./CalculationButton.js";
import { getBaseRequestData, inputIntegerPattern, REACT_APP_API_URL } from "../utils.js";
import { getBaseErrors, removeError, findPreviousCommonError, commonHandleInput } from "../utils.js";
import { useToggleButton } from "../hooks.js";
import axios from "axios";
import { saveAs } from "file-saver";
import { useTranslation } from "react-i18next";


function TariffsCalculator({ savedInput, savedErrors, setInput, setErrors }) {
    const { i18n } = useTranslation();
    // Get saved input from props or default input
    const input = savedInput || {
        insuranceType: "pure endowment",
        insurancePremiumFrequency: "simultaneously",
        gender: "male",
        technicalInterestRate: "",
        insuranceLoading: "",
        minimumInsuranceStartAge: "",
        maximumInsuranceStartAge: "",
        maximumInsurancePeriod: "",
        maximumInsurancePeriodYears: "",
        maximumInsurancePeriodMonths: "",
    }
    // Get saved errors from props or empty error dictionary
    const errors = savedErrors || Object.keys(input).reduce((acc, field) => {
        acc[field] = { fieldErrors: [], personalFieldErrors: false };
        return acc;
    }, {})


    const getExcludedFields = React.useCallback((inputData) => {
        let excludedFields = [];
        if (inputData.insuranceType !== "cumulative insurance") {
            excludedFields.push("maximumInsurancePeriodMonths", "maximumInsurancePeriodYears");
            if (inputData.insuranceType === "whole life insurance") {
                excludedFields.push("maximumInsurancePeriod");
            }
        } else {
            excludedFields.push("maximumInsurancePeriod", "minimumInsuranceStartAge", "maximumInsuranceStartAge");
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
        let updatedErrors = getBaseErrors(fieldName, updatedInput, currentErrors);

        fieldsToValidate = ["maximumInsurancePeriodYears", "maximumInsurancePeriodMonths"];
        if (fieldsToValidate.includes(fieldName)) {
            if (fieldName === "maximumInsurancePeriodMonths") {
                if (updatedInput.maximumInsurancePeriodMonths !== "" && Number(updatedInput.maximumInsurancePeriodMonths) > 11) {
                    updatedErrors[fieldName].fieldErrors.push({ message: "Number of months in maximum insurance period must be less than 12.", excludedInsuranceTypes: ["pure endowment", "term life insurance", "whole life insurance"] });
                    updatedErrors[fieldName].personalFieldErrors = true;
                }
            }

            commonErrorMessage = "Maximum insurance period must be greater than 0.";
            previousCommonErrorField = findPreviousCommonError(fieldsToValidate, updatedErrors, commonErrorMessage);
            personalFieldInputCorrect = fieldsToValidate.every((f) => updatedErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
            if (personalFieldInputCorrect) {
                if (Number(updatedInput.maximumInsurancePeriodYears) === 0 && Number(updatedInput.maximumInsurancePeriodMonths) === 0) {
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

        fieldsToValidate = ["maximumInsuranceStartAge", "maximumInsurancePeriod"];
        if (fieldsToValidate.includes(fieldName)) {
            if (fieldName === "maximumInsurancePeriod") {
                if (updatedInput.maximumInsurancePeriod !== "" && Number(updatedInput.maximumInsurancePeriod) <= 0) {
                    updatedErrors[fieldName].fieldErrors.push({ message: "Maximum insurance period must be greater than 0.", excludedInsuranceTypes: ["whole life insurance"] });
                    updatedErrors[fieldName].personalFieldErrors = true;
                }
            } else if (fieldName === "maximumInsuranceStartAge") {
                if (updatedInput.maximumInsuranceStartAge !== "" && Number(updatedInput.maximumInsuranceStartAge) > 100) {
                    updatedErrors[fieldName].fieldErrors.push({ message: "Maximum age of insurance start can't be greater than 100.", excludedInsuranceTypes: ["cumulative insurance"] });
                    updatedErrors[fieldName].personalFieldErrors = true;
                }
            }
            commonErrorMessage = "Sum of maximum insurance age and maximum insurance period can't be greater than 101 year.";
            previousCommonErrorField = findPreviousCommonError(fieldsToValidate, updatedErrors, commonErrorMessage);
            personalFieldInputCorrect = fieldsToValidate.every((f) => updatedErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
            if (personalFieldInputCorrect) {
                if (Number(updatedInput.maximumInsurancePeriod) + Number(updatedInput.maximumInsuranceStartAge) > 101) {
                    if (previousCommonErrorField === null) {
                        updatedErrors[fieldName].fieldErrors.push({ message: commonErrorMessage, excludedInsuranceTypes: ["cumulative insurance", "whole life insurance"] });
                    }
                } else {
                    removeError(previousCommonErrorField, updatedErrors, commonErrorMessage);
                }
            } else {
                removeError(previousCommonErrorField, updatedErrors, commonErrorMessage);
            }
        }

        fieldsToValidate = ["minimumInsuranceStartAge", "maximumInsuranceStartAge"];
        if (fieldsToValidate.includes(fieldName)) {
            commonErrorMessage = "Minimum age of insurance start can't be greater than maximum age of insurance start.";
            previousCommonErrorField = findPreviousCommonError(fieldsToValidate, updatedErrors, commonErrorMessage);
            personalFieldInputCorrect = fieldsToValidate.every((f) => updatedErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
            if (personalFieldInputCorrect) {
                if (Number(updatedInput.minimumInsuranceStartAge) > Number(updatedInput.maximumInsuranceStartAge)) {
                    if (previousCommonErrorField === null) {
                        updatedErrors[fieldName].fieldErrors.push({ message: commonErrorMessage, excludedInsuranceTypes: ["cumulative insurance"] });
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

    // Build tariffs table when "Calculate" button is pressed
    const handleSubmit = async (event) => {
        event.preventDefault();
        const routeURL = `${REACT_APP_API_URL}tariffs/`;
        let requestData = getBaseRequestData(input);
        requestData.insuranceLoading = input.insuranceLoading / 100;
        requestData.responseLanguageCode = i18n.language;

        if (input.insuranceType !== "cumulative insurance") {
            requestData.minimumInsuranceStartAge = input.minimumInsuranceStartAge;
            requestData.maximumInsuranceStartAge = input.maximumInsuranceStartAge;
            requestData.gender = input.gender;
            if (input.insuranceType !== "whole life insurance") {
                requestData.maximumInsurancePeriod = 12 * Number(input.maximumInsurancePeriod);
            }
        } else {
            requestData.maximumInsurancePeriod = 12 * Number(input.maximumInsurancePeriodYears) + Number(input.maximumInsurancePeriodMonths);
        }

        const requestParameters = { responseType: "blob" }
        try {
            const response = await axios.post(routeURL, requestData, requestParameters);
            const blob = new Blob([response.data], { type: response.headers["content-type"] });
            saveAs(blob, "tariffs.xlsx");
        } catch (error) {
            console.error(`Error while sending request to ${routeURL}`, error);
        }
    }

    return (
        <div className="calculator-form">
            <form onSubmit={handleSubmit} noValidate>
                <CalculatorTraitFieldGroup
                    insuranceType={input.insuranceType}
                    insurancePremiumFrequency={input.insurancePremiumFrequency}
                    gender={input.gender}
                    handleInput={handleInput}
                />
                <React.Fragment>
                    {input.insuranceType !== "cumulative insurance" && (
                        <React.Fragment>
                            <CalculatorField labelText="Enter minimum insurance start age in years:">
                                <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name="minimumInsuranceStartAge" value={input.minimumInsuranceStartAge} onChange={handleInput} />
                                <CalculatorFieldErrorGroup errors={errors.minimumInsuranceStartAge} insuranceType={input.insuranceType} />
                            </CalculatorField>
                            <CalculatorField labelText="Enter maximum insurance start age in years:">
                                <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name="maximumInsuranceStartAge" value={input.maximumInsuranceStartAge} onChange={handleInput} />
                                <CalculatorFieldErrorGroup errors={errors.maximumInsuranceStartAge} insuranceType={input.insuranceType} />
                            </CalculatorField>
                        </React.Fragment>
                    )}

                    {input.insuranceType !== "whole life insurance" && (
                        input.insuranceType !== "cumulative insurance" ? (
                            <CalculatorField labelText="Enter maximum insurance period in years:">
                                <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name="maximumInsurancePeriod" value={input.maximumInsurancePeriod} onChange={handleInput} />
                                <CalculatorFieldErrorGroup errors={errors.maximumInsurancePeriod} insuranceType={input.insuranceType} />
                            </CalculatorField>
                        ) : (
                            <PeriodFieldGroup
                                labelText="Enter maximum insurance period:"
                                yearsFieldName="maximumInsurancePeriodYears"
                                monthsFieldName="maximumInsurancePeriodMonths"
                                yearsField={input.maximumInsurancePeriodYears}
                                monthsField={input.maximumInsurancePeriodMonths}
                                yearsFieldErrors={errors.maximumInsurancePeriodYears}
                                monthsFieldErrors={errors.maximumInsurancePeriodMonths}
                                insuranceType={input.insuranceType}
                                handleInput={handleInput}
                            />
                        )
                    )}
                </React.Fragment>
                <CalculatorPaymentFieldGroup
                    technicalInterestRate={input.technicalInterestRate}
                    insuranceLoading={input.insuranceLoading}
                    technicalInterestRateErrors={errors.technicalInterestRate}
                    insuranceLoadingErrors={errors.insuranceLoading}
                    insuranceType={input.insuranceType}
                    handleInput={handleInput}
                />
                <CalculationButton isButtonActive={isButtonActive} />
            </form>
        </div>
    );
}

export default TariffsCalculator;