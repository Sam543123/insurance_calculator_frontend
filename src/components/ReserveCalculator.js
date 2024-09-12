import React from "react";
import CalculatorField from "./CalculatorField.js"
import commonHandleInput from "../utils/handlers.js"
import { inputFloatPattern } from "../constants.js"


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
        acc[field] = null;
        return acc;
    }, {})
    const result = savedResult;

    // const handleInput = (e) => {
    //     commonHandleInput(e, input, setInput)
    // }

    const validate = (fieldName, updatedInput) => {
        let newErrors = { ...errors, [fieldName]: null };
        let fieldsToValidate;
        let commonError;
        newErrors = getBaseValidationErrors(fieldName, updatedInput, newErrors);
        newErrors = getIntermediateValidationErrors(fieldName, updatedInput, newErrors);   

        if (fieldName === "insurancePremium") {
            if (updatedInput.insurancePremium !== "" && updatedInput.insurancePremium < 0) {
                newErrors[fieldName] = { message: "Insurance premium must be greater than 0.", isPersonalFieldError: true };
            }
        } else if (fieldName === "insuranceSum") {
            if (updatedInput.insuranceSum !== "" && updatedInput.insuranceSum < 0) {
                newErrors[fieldName] = { message: "Insurance sum must be greater than 0.", isPersonalFieldError: true };
            }
        }

        fieldsToValidate = fieldsToValidate = ["reservePeriodYears", "reservePeriodMonths"];
        if (fieldsToValidate.includes(fieldName)) {
            if (fieldName === "reservePeriodMonths") {
                if (updatedInput.reservePeriodMonths !== "" && updatedInput.reservePeriodMonths > 11) {
                    newErrors[fieldName] = { message: "Number of months in period from insurance start to reserve calculation must be less than 12.", isPersonalFieldError: true };
                }
            }    
            commonError = "Period from insurance start to reserve calculation must be greater than 0.";
            clearPreviousCommonError(fieldsToValidate, newErrors, commonError);
            personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].isPersonalFieldError === false && updatedInput[f] !== "");
            if (personalFieldInputCorrect) {
                if (Number(updatedInput.reservePeriodYears) === 0 && Number(updatedInput.reservePeriodMonths) === 0) {
                    newErrors[fieldName] = { message: commonError, isPersonalFieldError: false };
                }
            }
        }

        fieldsToValidate = fieldsToValidate = ["insurancePeriodYears", "insurancePeriodMonths", "reservePeriodYears", "reservePeriodMonths"];
        if (fieldsToValidate.includes(fieldName)) {        
            commonError = "Period from insurance start to reserve calculation must be less than insurance period.";
            clearPreviousCommonError(fieldsToValidate, newErrors, commonError);
            personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].isPersonalFieldError === false && updatedInput[f] !== "");
            if (personalFieldInputCorrect) {
                if (fieldsToValidate.every((v) => updatedInput[v] !== "") && (12 * Number(updatedInput.reservePeriodYears) + Number(updatedInput.reservePeriodMonths)) >= (12 * Number(updatedInput.insurancePeriodYears) + Number(updatedInput.insurancePeriodMonths))) {
                    newErrors[fieldName] = { message: commonError, isPersonalFieldError: false };
                }
            }
        }
        setErrors(newErrors)
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

    React.useLayoutEffect(()=>{
       const buttonState = getButtonState(input, errors);
       setIsButtonActive(buttonState);
    }, [input, errors])

    const handleSubmit = async (e) => {
        e.preventDefault();
        const routeURL = `${API_URL}reserve/`;
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
                <CalculatorStartFieldGroup
                    insuranceType={input.insuranceType}
                    insurancePremiumFrequency={input.insurancePremiumFrequency}
                    gender={input.gender}
                    handleInput={handleInput}
                />
                <CalculatorMiddleFieldGroup
                    insuranceType={input.insuranceType}
                    birthDate={input.birthDate}
                    insuranceStartDate={input.insuranceStartDate}
                    insurancePeriodYears={input.insurancePeriodYears}
                    insurancePeriodMonths={input.insurancePeriodMonths}
                    birthDateError={errors.birthDate}
                    insuranceStartDateError={errors.insuranceStartDate}
                    insurancePeriodYearsError={errors.insurancePeriodYearsError}
                    insurancePeriodMonthsError={errors.insurancePeriodMonthsError}
                    handleInput={handleInput}
                />
                <CalculatorEndFieldGroup
                    insurancePremiumRate={input.insurancePremiumRate}
                    insuranceLoading={input.insuranceLoading}
                    insurancePremiumRateError={input.insurancePremiumRateError}
                    insuranceLoadingError={input.insuranceLoadingError}
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
                    {errors.insurancePremium && <div className="error">{errors.insurancePremium}</div>}
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
                    {errors.insuranceSum && <div className="error">{errors.insuranceSum}</div>}
                </div>
                <PeriodFieldGroup
                    labelText="Enter time from insurance start to reserve calculation:"
                    yearsFieldName="reservePeriodYears"
                    monthsFieldName="reservePeriodMonths"
                    yearsField={input.reservePeriodYears}
                    monthsField={input.reservePeriodMonths}
                    yearsFieldError={errors.reservePeriodYears}
                    monthsFieldError={errors.reservePeriodMonths}
                    handleChange={handleInput}
                />
                <button type="submit" disabled={!this.state.isButtonActive} className={!this.state.isButtonActive ? "disabled" : null}>Calculate</button>
                {(input.result) && (
                    <div className="result-display">
                        Reserve={result}
                    </div>
                )}
            </form>
        </div>
    );
}

export default ReserveCalculator;