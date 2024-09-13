import React from "react";
import CalculatorField from "./CalculatorField.js"
import commonHandleInput from "../utils/handlers.js"
import { inputIntegerPattern } from "../constants.js"


function TariffsCalculator({ savedInput, savedErrors, setInput, setErrors }) {
    const [isButtonActive, setIsButtonActive] = React.useState(false)
    const input = savedInput || {
        insuranceType: 'pure endowment',
        insurancePremiumFrequency: 'simultaneously',
        gender: 'male',
        insurancePremiumRate: '',
        insuranceLoading: '',
        insuranceMinimumStartAge: '',
        insuranceMaximumStartAge: '',
        maximumInsurancePeriod: '',
        maximumInsurancePeriodYears: '',
        maximumInsurancePeriodMonths: '',
    }
    const errors = savedErrors || Object.keys(input).reduce((acc, field) => {
        acc[field] = { messages: [], personalFieldErrors: false };
        return acc;
    }, {})

    // const handleInput = (e) => {
    //     commonHandleInput(e, input, setInput)
    // }

    const validate = (fieldName, updatedInput) => {
        let newErrors = { ...errors, [fieldName]: { messages: [], personalFieldErrors: false } };
        let fieldsToValidate;
        let commonError;
        newErrors = getBaseValidationErrors(fieldName, updatedInput, newErrors);       

        fieldsToValidate = ["maximumInsurancePeriodYears", "maximumInsurancePeriodMonths"];
        if (fieldsToValidate.includes(fieldName)) {                     
            if (fieldName === "maximumInsurancePeriodMonths") {
                if (updatedState.maximumInsurancePeriodMonths !== "" && Number(updatedState.maximumInsurancePeriodMonths) > 11) {
                    newErrors[fieldName].messages.push("Number of months in maximum insurance period must be less than 12.");
                    newErrors[fieldName].personalFieldErrors=true;
                }
            } 

            commonError = "Maximum insurance period must be greater than 0.";
            clearPreviousCommonError(fieldsToValidate, newErrors, commonError);
            personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].personalFieldErrors === false && updatedInput[f] !== "");          
            if (personalFieldInputCorrect) {
                if (Number(updatedInput.maximumInsurancePeriodYears) === 0 && Number(updatedInput.maximumInsurancePeriodMonths === 0)) {
                    newErrors[fieldName].messages.push(commonError);
                }
            }
        }
        fieldsToValidate = ["insuranceMinimumStartAge", "insuranceMaximumStartAge", "maximumInsurancePeriod"];
        if (fieldsToValidate.includes(fieldName)) {                       
            if (fieldName === "maximumInsurancePeriod") {
                if (updatedInput.maximumInsurancePeriod !== "" && Number(updatedInput.maximumInsurancePeriod) <= 0) {
                    newErrors[fieldName].messages.push("Maximum insurance period must be greater than 0.");
                    newErrors[fieldName].personalFieldErrors=true;
                }
            } else if (fieldName === "insuranceMaximumStartAge") {
                if (updatedInput.insuranceMaximumStartAge !== "" && Number(updatedInput.insuranceMaximumStartAge) > 100) {
                    newErrors[fieldName].messages.push("Maximum age of insurance start can't be greater than 100.");
                    newErrors[fieldName].personalFieldErrors=true;
                }
            }
            fieldsToValidate = ["insuranceMinimumStartAge", "insuranceMaximumStartAge"];
            commonError = "Minimum age of insurance start can't be greater than maximum age of insurance start.";
            clearPreviousCommonError(fieldsToValidate, newErrors, commonError);
            personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
            if (personalFieldInputCorrect) {
                if (Number(updatedInput.insuranceMinimumStartAge) > Number(updatedInput.insuranceMaximumStartAge)) {
                    newErrors[fieldName].messages.push(commonError);
                }
            }
            fieldsToValidate = ["insuranceMaximumStartAge", "maximumInsurancePeriod"];
            commonError = "Sum of maximum insurance age and maximum insurance period can't be greater than 101 year.";
            clearPreviousCommonError(fieldsToValidate, newErrors, commonError);
            personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
            if (personalFieldInputCorrect) {
                if (Number(updatedInput.maximumInsurancePeriod) + Number(updatedInput.insuranceMaximumStartAge) > 101) {
                    newErrors[fieldName].messages.push(commonError);
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
        const routeURL = `${API_URL}tariffs/`;
        let requestData = {
            insuranceType: input.insuranceType,
            insurancePremiumFrequency: input.insurancePremiumFrequency,
            gender: input.gender,
            insurancePremiumRate: input.insurancePremiumRate,
            insuranceLoading: input.insuranceLoading
        };

        requestData.insuranceMinimumStartAge = input.insuranceStartAge;
        requestData.insuranceMaximumStartAge = input.insuranceEndAge;
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
                <CalculatorStartFieldGroup
                    insuranceType={input.insuranceType}
                    insurancePremiumFrequency={input.insurancePremiumFrequency}
                    gender={input.gender}
                    handleInput={handleInput}
                />
                <React.Fragment>
                    {input.insuranceType !== "cumulative insurance" && (
                        <React.Fragment>
                            <CalculatorField labelText="Enter minimum insurance start age:">
                                <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name="insuranceMinimumStartAge" value={input.insuranceMinimumStartAge} onChange={handleInput} />
                                {errors.insuranceMinimumStartAge && <div className="error">{errors.insuranceMinimumStartAge}</div>}
                            </CalculatorField>
                            <CalculatorField labelText="Enter maximum insurance start age:">
                                <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name="insuranceMaximumStartAge" value={input.insuranceMaximumStartAge} onChange={handleInput} />
                                {errors.insuranceMaximumStartAge && <div className="error">{errors.insuranceMaximumStartAge}</div>}
                            </CalculatorField>
                        </React.Fragment>
                    )}

                    {input.insuranceType !== "whole life insurance" && (
                        input.insuranceType !== "cumulative insurance" ? (
                            <CalculatorField labelText="Enter maximum insurance period:">
                                <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name="maximumInsurancePeriod" value={input.maximumInsurancePeriod} onChange={handleInput} />
                                {errors.maximumInsurancePeriod && <div className="error">{errors.maximumInsurancePeriod}</div>}
                            </CalculatorField>
                        ) : (
                            <PeriodFieldGroup
                                labelText="Enter maximum insurance period:"
                                yearsFieldName="maximumInsurancePeriodYears"
                                monthsFieldName="maximumInsurancePeriodMonths"
                                calculatorState={this.state}
                                handleChange={this.handleChange}
                            />
                        )
                    )}
                </React.Fragment>
                <CalculatorEndFieldGroup
                    insurancePremiumRate={input.insurancePremiumRate}
                    insuranceLoading={input.insuranceLoading}
                    insurancePremiumRateError={input.insurancePremiumRateError}
                    insuranceLoadingError={input.insuranceLoadingError}
                    handleInput={handleInput}
                />
                <button type="submit" disabled={!this.state.isButtonActive} className={!this.state.isButtonActive ? "disabled" : null}>Calculate</button>
            </form>
        </div>
    );
}

export default TariffsCalculator;