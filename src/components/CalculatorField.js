import React from "react";

function CalculatorField({ labelText, children }) {
    return (
        <div className="field-block">
            <label>
                {labelText}
            </label>
            {children}
        </div>
    )
}

export default CalculatorField;