import React from "react";
import CalculatorField from "./CalculatorField.js"
import {inputIntegerPattern} from "../constants.js"

function PeriodFieldGroup(props) {
    return (
        <CalculatorField labelText={props.labelText}>
            <div className="inputs-group">
                <div>
                    <label>
                        years
                    </label>
                    <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name={props.yearsFieldName} value={props.yearsField} onChange={props.handleInput} />
                    {props.yearsFieldError && <div className="error">{props.yearsFieldError}</div>}
                </div>
                <div className="inputs-group">
                    <label>
                        months
                    </label>
                    <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name={props.monthsFieldName} value={props.monthsField.} onChange={props.handleInput} />
                    {props.monthsFieldError && <div className="error">{props.monthsFieldError}</div>}
                </div>
            </div>
        </CalculatorField>
    )
}

export default PeriodFieldGroup;