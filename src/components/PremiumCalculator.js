import React from "react";
import CalculatorField from "./CalculatorField.js"
import commonHandleInput from "../utils/handlers.js"
import CalculatorStartFieldGroup from "./CalculatorStartFieldGroup.js"
import CalculatorMiddleFieldGroup from "./CalculatorMiddleFieldGroup.js"
import CalculatorEndFieldGroup from "./CalculatorEndFieldGroup.js"
import { clearPreviousCommonError } from "../utils.js"


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
        insurancePremium: ''
    }
    const errors = savedErrors || Object.keys(input).reduce((acc, field) => {
        acc[field] = { message: "", isPersonalFieldError: false };
        return acc;
    }, {})

    const result = savedResult;

    const validate = (fieldName, updatedInput) => {
        let newErrors = { ...errors, [fieldName]: null };
        let fieldsToValidate;
        let commonError;
        const currentDate = new Date();

        if (fieldName === "insuranceLoading") {
            if (updatedInput.insuranceLoading !== "" && updatedInput.insuranceLoading >= 1) {
                newErrors[fieldName] = { message: "Insurance loading must be less than 1.", isPersonalFieldError: true };
            }
        } else if (fieldName === "insurancePremium") {
            if (updatedInput.insurancePremium !== "" && updatedInput.insurancePremium < 0) {
                newErrors[fieldName] = { message: "Insurance premium must be greater than 0.", isPersonalFieldError: true };
            }
        } else if (fieldName === "insuranceSum") {
            if (updatedInput.insuranceSum !== "" && updatedInput.insuranceSum < 0) {
                newErrors[fieldName] = { message: "Insurance sum must be greater than 0.", isPersonalFieldError: true };
            }
        } else if (["birthDate", "insuranceStartDate", "insurancePeriodYears", "insurancePeriodMonths"].includes(fieldName)) {

            if (fieldName === "birthDate" || fieldName === "insuranceStartDate") {
                if (fieldName === "birthDate") {
                    if (updatedInput.birthDate !== "" && Date.parse(updatedInput.birthDate) > currentDate) {
                        newErrors[fieldName] = { message: "Birth date can't be later than current moment.", isPersonalFieldError: true };
                    }
                }
                fieldsToValidate = ["insuranceStartDate", "birthDate"];
                commonError = "Birth date can't be later than insurance start date."
                clearPreviousCommonError(fieldsToValidate, newErrors, commonError);
                personalFieldInputCorrect = fieldsToValidate.every((f) => errors[f].isPersonalFieldError === false && updatedInput[f] !== "");
                if (personalFieldInputCorrect) {
                    if (Date.parse(updatedInput.birthDate) > Date.parse(updatedInput.insuranceStartDate)) {
                        newErrors[fieldName] = { message: commonError, isPersonalFieldError: false };
                    }
                }

            } else if (fieldName === "insurancePeriodYears" || fieldName === "insurancePeriodMonths") {
                if (fieldName === "insurancePeriodMonths") {
                    if (updatedInput.insurancePeriodMonths !== "" && updatedInput.insurancePeriodMonths > 11) {
                        newErrors[fieldName] = { message: "Number of months in insurance period must be less than 12.", isPersonalFieldError: true };
                    }
                }

                fieldsToValidate = ["insurancePeriodYears", "insurancePeriodMonths"];
                commonError = "Insurance period must be greater than 0.";
                clearPreviousCommonError(fieldsToValidate, newErrors, commonError);
                personalFieldInputCorrect = fieldsToValidate.every((f) => errors[f].isPersonalFieldError === false && updatedInput[f] !== "");
                if (personalFieldInputCorrect) {
                    if (Number(updatedInput.insurancePeriodYears) === 0 && Number(updatedInput.insurancePeriodMonths) === 0) {
                        newErrors[fieldName] = { message: commonError, isPersonalFieldError: false };
                    }
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

    const toggleButton = () => {
        const allFields = Object.keys(input);
        let excludedFields = [];
        if (input.insuranceType !== "cumulative insurance") {                   
            if (input.insuranceType === "whole life insurance") {
                excludedFields.push("insurancePeriodYears", "insurancePeriodMonths");
            }
        } else {
            excludedFields.push("birthDate", "insuranceStartDate");            
        }

        const trackedFields = allFields.filter((v) => !excludedFields.includes(v));
        if (trackedFields.every((v) => input[v] !== "") && trackedFields.every((v) => !errors[v])) {
            setIsButtonActive(true);           
        }
    }

    React.useLayoutEffect(()=>{
        toggleButton();
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
                <CalculatorField labelText="Enter insurance sum:">
                    <input type="text" inputMode="numeric" pattern={inputFloatPattern} name="insuranceSum" value={input.insuranceSum} onChange={handleChange} />
                    {errors.insuranceSum && <div className="error">{errors.insuranceSum}</div>}
                </CalculatorField>
                <button type="submit" disabled={!isButtonActive} className={isButtonActive ? "disabled" : null}>Calculate</button>
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