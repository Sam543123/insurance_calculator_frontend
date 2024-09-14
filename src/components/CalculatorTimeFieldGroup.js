import React from "react";
import CalculatorField from "./CalculatorField.js"
import PeriodFieldGroup from "./PeriodFieldGroup.js";

function CalculatorTimeFieldGroup(props) {
    return (
        <React.Fragment>
            {props.insuranceType !== "cumulative insurance" && (
                <React.Fragment>
                    <CalculatorField labelText="Enter birth date of the insured:">
                        <input type="date" name="birthDate" value={props.birthDate} onChange={props.handleInput} />
                        {props.birthDateErrors && <div className="error">{props.birthDateErrors.messages.map((m)=><p key={m}>{m}</p>)}</div>}
                    </CalculatorField>
                    <CalculatorField labelText="Enter start date of insurance:">
                        <input type="date" name="insuranceStartDate" value={props.insuranceStartDate} onChange={props.handleInput} />
                        {props.insuranceStartDateErrors && <div className="error">{props.insuranceStartDateErrors.messages.map((m)=><p key={m}>{m}</p>)}</div>}
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
                    handleInput={props.handleInput}
                />
            )}
        </React.Fragment>
    )
}

export default CalculatorTimeFieldGroup;