import React from "react";
import CalculatorField from "./CalculatorField.js";
import PeriodFieldGroup from "./PeriodFieldGroup.js";
import CalculatorFieldErrorGroup from "./CalculatorFieldErrorGroup.js";
import { useTranslation } from "react-i18next";

function CalculatorTimeFieldGroup(props) {
    const { i18n } = useTranslation();
    // Render group of input calculator fields related to time
    return (
        <React.Fragment>
            {props.insuranceType !== "cumulative insurance" && (
                <React.Fragment>
                    <CalculatorField labelText="Enter birth date of insured person:">
                        <input type="date" name="birthDate" value={props.birthDate} lang={i18n.language} onChange={props.handleInput} />
                        <CalculatorFieldErrorGroup errors={props.birthDateErrors} insuranceType={props.insuranceType} />
                    </CalculatorField>
                    <CalculatorField labelText="Enter start date of insurance:">
                        <input type="date" name="insuranceStartDate" value={props.insuranceStartDate} lang={i18n.language} onChange={props.handleInput} />
                        <CalculatorFieldErrorGroup errors={props.insuranceStartDateErrors} insuranceType={props.insuranceType} />
                    </CalculatorField>
                </React.Fragment>
            )}
            {props.insuranceType !== "whole life insurance" && (
                <PeriodFieldGroup
                    labelText="Enter insurance period:"
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