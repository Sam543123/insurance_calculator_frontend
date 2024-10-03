import React from "react";
import CalculatorField from "./CalculatorField.js";
import PeriodFieldGroup from "./PeriodFieldGroup.js";
import CalculatorFieldErrorGroup from "./CalculatorFieldErrorGroup.js";

function CalculatorTimeFieldGroup(props) {
    return (
        <React.Fragment>
            {props.insuranceType !== "cumulative insurance" && (
                <React.Fragment>
                    <CalculatorField labelText="Enter birth date of the insured:">
                        <input type="date" name="birthDate" value={props.birthDate} onChange={props.handleInput} />
                        <CalculatorFieldErrorGroup errors={props.birthDateErrors} insuranceType={props.insuranceType}/> 
                    </CalculatorField>
                    <CalculatorField labelText="Enter start date of insurance:">
                        <input type="date" name="insuranceStartDate" value={props.insuranceStartDate} onChange={props.handleInput} />
                        <CalculatorFieldErrorGroup errors={props.insuranceStartDateErrors} insuranceType={props.insuranceType}/>                        
                    </CalculatorField>
                </React.Fragment>
            )}
            {props.insuranceType !== "whole life insurance" && (
                <PeriodFieldGroup
                    labelText="Enter the insurance period:"
                    yearsFieldName="insurancePeriodYears"
                    monthsFieldName="insurancePeriodMonths"
                    yearsField={props.insurancePeriodYears}
                    monthsField={props.insurancePeriodMonths}
                    yearsFieldErrors={props.insurancePeriodYearsErrors}
                    monthsFieldErrors={props.insurancePeriodMonthsErrors}
                    insuranceType={props.insuranceType}
                    handleInput={props.handleInput}
                />
            )}
        </React.Fragment>
    )
}

export default CalculatorTimeFieldGroup;