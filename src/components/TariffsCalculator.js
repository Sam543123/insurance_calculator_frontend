import React from "react";
import CalculatorField from "./CalculatorField.js";
import CalculatorTraitFieldGroup from "./CalculatorTraitFieldGroup.js";
import CalculatorPaymentFieldGroup from "./CalculatorPaymentFieldGroup.js";
import PeriodFieldGroup from "./PeriodFieldGroup.js";
import { inputIntegerPattern, API_URL } from "../constants.js";
import { getBaseErrors, clearPreviousCommonError, commonHandleInput } from "../utils.js";
import { useToggleButton } from "../hooks.js";
import axios from "axios";
import { saveAs } from "file-saver";


function TariffsCalculator({ savedInput, savedErrors, setInput, setErrors }) {
    // const [isButtonActive, setIsButtonActive] = React.useState(false)
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
        acc[field] = { messages: [], personalFieldErrors: false };
        return acc;
    }, {})

    const getExcludedFields = React.useCallback(() => {
        let excludedFields = getCommonExcludedFields(input);
        if (input.insuranceType !== "cumulative insurance") {
            excludedFields.push("maximumInsurancePeriodMonths", "maximumInsurancePeriodYears");
            if (input.insuranceType === "whole life insurance") {
                excludedFields.push("maximumInsurancePeriod");
            }
        }
        return excludedFields
    }, [input])
    const isButtonActive = useToggleButton(input, errors, getExcludedFields);

    const validate = (fieldName, updatedInput) => {
        let newErrors = { ...errors, [fieldName]: { messages: [], personalFieldErrors: false } };
        let fieldsToValidate;
        let commonError;
        let personalFieldInputCorrect;
        newErrors = getBaseErrors(fieldName, updatedInput, newErrors);

        fieldsToValidate = ["maximumInsurancePeriodYears", "maximumInsurancePeriodMonths"];
        if (fieldsToValidate.includes(fieldName)) {
            if (fieldName === "maximumInsurancePeriodMonths") {
                if (updatedInput.maximumInsurancePeriodMonths !== "" && Number(updatedInput.maximumInsurancePeriodMonths) > 11) {
                    newErrors[fieldName].messages.push("Number of months in maximum insurance period must be less than 12.");
                    newErrors[fieldName].personalFieldErrors = true;
                }
            }

            commonError = "Maximum insurance period must be greater than 0.";
            clearPreviousCommonError(fieldsToValidate, newErrors, commonError);
            personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
            if (personalFieldInputCorrect) {
                if (Number(updatedInput.maximumInsurancePeriodYears) === 0 && Number(updatedInput.maximumInsurancePeriodMonths) === 0) {
                    newErrors[fieldName].messages.push(commonError);
                }
            }
        }

        fieldsToValidate = ["maximumInsuranceStartAge", "maximumInsurancePeriod"];
        if (fieldsToValidate.includes(fieldName)) {
            if (fieldName === "maximumInsurancePeriod") {
                if (updatedInput.maximumInsurancePeriod !== "" && Number(updatedInput.maximumInsurancePeriod) <= 0) {
                    newErrors[fieldName].messages.push("Maximum insurance period must be greater than 0.");
                    newErrors[fieldName].personalFieldErrors = true;
                }
            } else if (fieldName === "maximumInsuranceStartAge") {
                if (updatedInput.maximumInsuranceStartAge !== "" && Number(updatedInput.maximumInsuranceStartAge) > 100) {
                    newErrors[fieldName].messages.push("Maximum age of insurance start can't be greater than 100.");
                    newErrors[fieldName].personalFieldErrors = true;
                }
            }
            commonError = "Sum of maximum insurance age and maximum insurance period can't be greater than 101 year.";
            clearPreviousCommonError(fieldsToValidate, newErrors, commonError);
            personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
            if (personalFieldInputCorrect) {
                if (Number(updatedInput.maximumInsurancePeriod) + Number(updatedInput.maximumInsuranceStartAge) > 101) {
                    newErrors[fieldName].messages.push(commonError);
                }
            }
        }

        fieldsToValidate = ["minimumInsuranceStartAge", "maximumInsuranceStartAge"];
        if (fieldsToValidate.includes(fieldName)) {
            commonError = "Minimum age of insurance start can't be greater than maximum age of insurance start.";
            clearPreviousCommonError(fieldsToValidate, newErrors, commonError);
            personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
            if (personalFieldInputCorrect) {
                if (Number(updatedInput.minimumInsuranceStartAge) > Number(updatedInput.maximumInsuranceStartAge)) {
                    newErrors[fieldName].messages.push(commonError);
                }
            }
        }
        return newErrors;
    }

    // const handleInput = (e) => {       
    //     if (!e.target.validity.valid) {
    //         return;
    //     }
    //     const { name, value } = e.target;
    //     const updatedInput = { ...input, [name]: value }
    //     const newErrors = validate(name, updatedInput)
    //     setInput(updatedInput);
    //     setErrors(newErrors);       
    // }

    const handleInput = (e) => {
        commonHandleInput(e, input, validate, setInput, setErrors);
    };


    // React.useLayoutEffect(() => {
    //     let buttonState = false;
    //     const allFields = Object.keys(input);
    //     let excludedFields = [];
    //     if (input.insuranceType !== "cumulative insurance") {
    //         excludedFields.push("maximumInsurancePeriodMonths", "maximumInsurancePeriodYears");
    //         if (input.insuranceType === "whole life insurance") {
    //             excludedFields.push("maximumInsurancePeriod");
    //         }
    //     }

    //     const trackedFields = allFields.filter((v) => !excludedFields.includes(v));
    //     if (trackedFields.every((v) => input[v] !== "") && trackedFields.every((v) => errors[v].messages.length === 0)) {
    //         buttonState = true;
    //     }
    //     setIsButtonActive(buttonState);
    // }, [input, errors])


    const handleSubmit = async (e) => {
        e.preventDefault();
        const routeURL = `${API_URL}tariffs/`;
        let requestData = {
            insuranceType: input.insuranceType,
            insurancePremiumFrequency: input.insurancePremiumFrequency,
            gender: input.gender,
            insurancePremiumRate: input.insurancePremiumRate,
            insuranceLoading: input.insuranceLoading,
            minimumInsuranceStartAge: input.minimumInsuranceStartAge,
            maximumInsuranceStartAge: input.maximumInsuranceStartAge
        };

        if (input.insuranceType !== "cumulative insurance") {
            requestData.maximumInsurancePeriod = 12 * Number(input.maximumInsurancePeriod);
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
                                {errors.minimumInsuranceStartAge && <div className="error">{errors.minimumInsuranceStartAge.messages.map((m) => <p key={m}>{m}</p>)}</div>}
                            </CalculatorField>
                            <CalculatorField labelText="Enter maximum insurance start age:">
                                <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name="maximumInsuranceStartAge" value={input.maximumInsuranceStartAge} onChange={handleInput} />
                                {errors.maximumInsuranceStartAge && <div className="error">{errors.maximumInsuranceStartAge.messages.map((m) => <p key={m}>{m}</p>)}</div>}
                            </CalculatorField>
                        </React.Fragment>
                    )}

                    {input.insuranceType !== "whole life insurance" && (
                        input.insuranceType !== "cumulative insurance" ? (
                            <CalculatorField labelText="Enter maximum insurance period:">
                                <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name="maximumInsurancePeriod" value={input.maximumInsurancePeriod} onChange={handleInput} />
                                {errors.maximumInsurancePeriod && <div className="error">{errors.maximumInsurancePeriod.messages.map((m) => <p key={m}>{m}</p>)}</div>}
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
                    handleInput={handleInput}
                />
                <button type="submit" disabled={!isButtonActive} className={!isButtonActive ? "disabled" : null}>Calculate</button>
            </form>
        </div>
    );
}

export default TariffsCalculator;