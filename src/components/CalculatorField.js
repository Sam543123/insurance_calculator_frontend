import React from "react";

function CalculatorField({ labelText, children }) {
    // Wrapper for label and input field
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