import React from "react";
import CalculatorField from "./CalculatorField.js";
import { inputIntegerPattern } from "../utils.js";
import CalculatorFieldErrorGroup from "./CalculatorFieldErrorGroup.js";

function PeriodFieldGroup(props) {
    return (
        <CalculatorField labelText={props.labelText}>
            <div className="inputs-group">
                <div>
                    <label>
                        years
                    </label>
                    <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name={props.yearsFieldName} value={props.yearsField} onChange={props.handleInput} />
                    <CalculatorFieldErrorGroup errors={props.yearsFieldErrors}  insuranceType={props.insuranceType} />                  
                </div>
                <div>
                    <label>
                        months
                    </label>
                    <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name={props.monthsFieldName} value={props.monthsField} onChange={props.handleInput} />
                    <CalculatorFieldErrorGroup errors={props.monthsFieldErrors}  insuranceType={props.insuranceType} />                 
                </div>
            </div>
        </CalculatorField>
    )
}

export default PeriodFieldGroup;