import React from "react";
import CalculatorField from "./CalculatorField.js"
import PeriodFieldGroup from "./PeriodFieldGroup";

function CalculatorMiddleFieldGroup(props) {
    return (
        <React.Fragment>
            {insuranceType !== "cumulative insurance" && (
                <React.Fragment>
                    <CalculatorField labelText="Enter birth date of the insured:">
                        <input type="date" name="birthDate" value={props.birthDate} onChange={props.handleInput} />
                        {props.birthDateError && <div className="error">{props.birthDateError}</div>}
                    </CalculatorField>
                    <CalculatorField labelText="Enter start date of insurance:">
                        <input type="date" name="insuranceStartDate" value={props.insuranceStartDate} onChange={props.handleInput} />
                        {props.insuranceStartDateError && <div className="error">{props.insuranceStartDateError}</div>}
                    </CalculatorField>
                </React.Fragment>
            )}
            {state.insuranceType !== "whole life insurance" && (
                <PeriodFieldGroup
                    labelText="Enter the insurance period:"
                    yearsFieldName="insurancePeriodYearsName"
                    monthsFieldName="insurancePeriodMonthsName"
                    yearsField={props.insurancePeriodYears}
                    monthsField={props.insurancePeriodMonths}
                    yearsFieldError={props.insurancePeriodYearsError}
                    monthsFieldError={props.insurancePeriodMonthsError}
                    handleInput={props.handleInput}
                />
            )}
        </React.Fragment>
    )
}

export default CalculatorMiddleFieldGroup;