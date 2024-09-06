import React from "react";
import CalculatorField from "./CalculatorField.js"
import commonHandleInput from "../utils/handlers.js"
import CalculatorStartFieldGroup from "./CalculatorStartFieldGroup.js"
import CalculatorMiddleFieldGroup from "./CalculatorMiddleFieldGroup.js"
import CalculatorEndFieldGroup from "./CalculatorEndFieldGroup.js"


function PremiumCalculator({ savedInput, savedErrors, savedResult, setInput, setErrors, setResult }) {
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
        acc[field] = null;
        return acc;
    }, {})

    const result = savedResult;

    const handleInput = (e) => {
        commonHandleInput(e, input, setInput)
    }

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
                <button type="submit" disabled={!this.state.isButtonActive} className={!this.state.isButtonActive ? "disabled" : null}>Calculate</button>
                {(input.result) && (
                    <div className="result-display">
                        Insurance premium={result}
                    </div>
                )}
            </form>
        </div>
    );
}

export default PremiumCalculator;