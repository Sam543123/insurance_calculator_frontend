import React from "react";
import CalculatorField from "./CalculatorField.js"
import commonHandleInput from "../utils/handlers.js"
import { inputIntegerPattern } from "../constants.js"


function TariffsCalculator({ savedInput, savedErrors, setInput, setErrors }) {
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
        acc[field] = null;
        return acc;
    }, {})

    const handleInput = (e) => {
        commonHandleInput(e, input, setInput)
    }

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