import React from "react";
import CalculatorField from "./CalculatorField.js";
import CalculatorTraitFieldGroup from "./CalculatorTraitFieldGroup.js";
import CalculatorPaymentFieldGroup from "./CalculatorPaymentFieldGroup.js";
import PeriodFieldGroup from "./PeriodFieldGroup.js";
import CalculatorFieldErrorGroup from "./CalculatorFieldErrorGroup.js";
import { inputIntegerPattern, REACT_APP_API_URL  } from "../utils.js";
import { getBaseErrors, removeError, findPreviousCommonError, commonHandleInput } from "../utils.js";
import { useToggleButton } from "../hooks.js";
import axios from "axios";
import { saveAs } from "file-saver";


function TariffsCalculator({ savedInput, savedErrors, setInput, setErrors }) {
    const input = savedInput || {
        insuranceType: 'pure endowment',
        insurancePremiumFrequency: 'simultaneously',
        gender: 'male',
        insurancePremiumRate: '',
        insuranceLoading: '',
        minimumInsuranceStartAge: '',
        maximumInsuranceStartAge: '',
        maximumInsurancePeriod: '',
        maximumInsurancePeriodYears: '',
        maximumInsurancePeriodMonths: '',
    }
    const errors = savedErrors || Object.keys(input).reduce((acc, field) => {
        acc[field] = { fieldErrors: [], personalFieldErrors: false };
        return acc;
    }, {})


    const getExcludedFields = React.useCallback(() => {
        let excludedFields = [];
        if (input.insuranceType !== "cumulative insurance") {
            excludedFields.push("maximumInsurancePeriodMonths", "maximumInsurancePeriodYears");
            if (input.insuranceType === "whole life insurance") {
                excludedFields.push("maximumInsurancePeriod");
            }
        } else {
            excludedFields.push("maximumInsurancePeriod", "minimumInsuranceStartAge", "maximumInsuranceStartAge");
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

        fieldsToValidate = ["maximumInsurancePeriodYears", "maximumInsurancePeriodMonths"];
        if (fieldsToValidate.includes(fieldName)) {
            if (fieldName === "maximumInsurancePeriodMonths") {
                if (updatedInput.maximumInsurancePeriodMonths !== "" && Number(updatedInput.maximumInsurancePeriodMonths) > 11) {
                    newErrors[fieldName].fieldErrors.push({ message: "Number of months in maximum insurance period must be less than 12.", excludedInsuranceTypes: ["pure endowment", "cumulative insurance", "whole life insurance"] });
                    newErrors[fieldName].personalFieldErrors = true;
                }
            }

            commonErrorMessage = "Maximum insurance period must be greater than 0.";
            previousCommonErrorField = findPreviousCommonError(fieldsToValidate, newErrors, commonErrorMessage);
            personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
            if (personalFieldInputCorrect) {
                if (Number(updatedInput.maximumInsurancePeriodYears) === 0 && Number(updatedInput.maximumInsurancePeriodMonths) === 0) {
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

        fieldsToValidate = ["maximumInsuranceStartAge", "maximumInsurancePeriod"];
        if (fieldsToValidate.includes(fieldName)) {
            if (fieldName === "maximumInsurancePeriod") {
                if (updatedInput.maximumInsurancePeriod !== "" && Number(updatedInput.maximumInsurancePeriod) <= 0) {
                    newErrors[fieldName].fieldErrors.push({ message: "Maximum insurance period must be greater than 0.", excludedInsuranceTypes: ["whole life insurance"] });
                    newErrors[fieldName].personalFieldErrors = true;
                }
            } else if (fieldName === "maximumInsuranceStartAge") {
                if (updatedInput.maximumInsuranceStartAge !== "" && Number(updatedInput.maximumInsuranceStartAge) > 100) {
                    newErrors[fieldName].fieldErrors.push({ message: "Maximum age of insurance start can't be greater than 100.", excludedInsuranceTypes: ["cumulative insurance"] });
                    newErrors[fieldName].personalFieldErrors = true;
                }
            }
            commonErrorMessage = "Sum of maximum insurance age and maximum insurance period can't be greater than 101 year.";
            previousCommonErrorField = findPreviousCommonError(fieldsToValidate, newErrors, commonErrorMessage);
            personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
            if (personalFieldInputCorrect) {
                if (Number(updatedInput.maximumInsurancePeriod) + Number(updatedInput.maximumInsuranceStartAge) > 101) {
                    if (previousCommonErrorField === null) {
                        newErrors[fieldName].fieldErrors.push({ message: commonErrorMessage, excludedInsuranceTypes: ["cumulative insurance", "whole life insurance"] });
                    }
                } else {
                    removeError(previousCommonErrorField, newErrors, commonErrorMessage);
                }
            } else {
                removeError(previousCommonErrorField, newErrors, commonErrorMessage);
            }
        }

        fieldsToValidate = ["minimumInsuranceStartAge", "maximumInsuranceStartAge"];
        if (fieldsToValidate.includes(fieldName)) {
            commonErrorMessage = "Minimum age of insurance start can't be greater than maximum age of insurance start.";
            previousCommonErrorField = findPreviousCommonError(fieldsToValidate, newErrors, commonErrorMessage);
            personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
            if (personalFieldInputCorrect) {
                if (Number(updatedInput.minimumInsuranceStartAge) > Number(updatedInput.maximumInsuranceStartAge)) {
                    if (previousCommonErrorField === null) {
                        newErrors[fieldName].fieldErrors.push({ message: commonErrorMessage, excludedInsuranceTypes: ["cumulative insurance"] });
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
        const routeURL = `${REACT_APP_API_URL }tariffs/`;
        let requestData = {
            insuranceType: input.insuranceType,
            insurancePremiumFrequency: input.insurancePremiumFrequency,
            gender: input.gender,
            insurancePremiumRate: input.insurancePremiumRate,
            insuranceLoading: input.insuranceLoading
        };

        if (input.insuranceType !== "cumulative insurance") {
            requestData.minimumInsuranceStartAge = input.minimumInsuranceStartAge;
            requestData.maximumInsuranceStartAge = input.maximumInsuranceStartAge;
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
        <div className="App">
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
                            <CalculatorField labelText="Enter minimum insurance start age:">
                                <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name="minimumInsuranceStartAge" value={input.minimumInsuranceStartAge} onChange={handleInput} />
                                <CalculatorFieldErrorGroup errors={errors.minimumInsuranceStartAge} insuranceType={input.insuranceType} />
                            </CalculatorField>
                            <CalculatorField labelText="Enter maximum insurance start age:">
                                <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name="maximumInsuranceStartAge" value={input.maximumInsuranceStartAge} onChange={handleInput} />
                                <CalculatorFieldErrorGroup errors={errors.maximumInsuranceStartAge} insuranceType={input.insuranceType} />
                            </CalculatorField>
                        </React.Fragment>
                    )}

                    {input.insuranceType !== "whole life insurance" && (
                        input.insuranceType !== "cumulative insurance" ? (
                            <CalculatorField labelText="Enter maximum insurance period:">
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
                    insurancePremiumRate={input.insurancePremiumRate}
                    insuranceLoading={input.insuranceLoading}
                    insurancePremiumRateErrors={errors.insurancePremiumRate}
                    insuranceLoadingErrors={errors.insuranceLoading}
                    insuranceType={input.insuranceType}
                    handleInput={handleInput}
                />
                <button type="submit" disabled={!isButtonActive} className={!isButtonActive ? "disabled" : null}>Calculate</button>
            </form>
        </div>
    );
}

export default TariffsCalculator;