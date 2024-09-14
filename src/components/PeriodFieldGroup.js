import React from "react";
import CalculatorField from "./CalculatorField.js"
import { inputIntegerPattern } from "../constants.js"

function PeriodFieldGroup(props) {
    return (
        <CalculatorField labelText={props.labelText}>
            <div className="inputs-group">
                <div>
                    <label>
                        years
                    </label>
                    <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name={props.yearsFieldName} value={props.yearsField} onChange={props.handleInput} />
                    {props.yearsFieldErrors && <div className="error">{props.yearsFieldErrors.messages.map((m) => <p key={m}>{m}</p>)}</div>}
                </div>
                <div>
                    <label>
                        months
                    </label>
                    <input type="text" inputMode="numeric" pattern={inputIntegerPattern} name={props.monthsFieldName} value={props.monthsField} onChange={props.handleInput} />
                    {props.monthsFieldErrors && <div className="error">{props.monthsFieldErrors.messages.map((m) => <p key={m}>{m}</p>)}</div>}
                </div>

            </div>
        </CalculatorField>
    )
}

export default PeriodFieldGroup;