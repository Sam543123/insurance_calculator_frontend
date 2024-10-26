import React from "react";
import CalculatorField from "./CalculatorField.js";
import { inputIntegerPattern } from "../utils.js";
import CalculatorFieldErrorGroup from "./CalculatorFieldErrorGroup.js";

function PeriodFieldGroup(props) {
    // Render group of years and months fields with label
    return (
        <CalculatorField labelText={props.labelText}>
            <div className="period-field-group">
                <div className="period-field">
                    <div className="period-field-input">
                        <label>
                            years
                        </label>
                        <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name={props.yearsFieldName} value={props.yearsField} onChange={props.handleInput} />
                    </div>
                    <CalculatorFieldErrorGroup errors={props.yearsFieldErrors} insuranceType={props.insuranceType} />
                </div>
                <div className="period-field">
                    <div className="period-field-input">
                        <label>
                            months
                        </label>
                        <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name={props.monthsFieldName} value={props.monthsField} onChange={props.handleInput} />
                    </div>
                    <CalculatorFieldErrorGroup errors={props.monthsFieldErrors} insuranceType={props.insuranceType} />
                </div>
            </div>
        </CalculatorField>
    )
}

export default PeriodFieldGroup;