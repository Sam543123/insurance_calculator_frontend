import React from "react";

function CalculatorFieldErrorGroup({ errors, insuranceType }) {
    // Render all errors for calculator input field related to specific insurance type
    return (
        <React.Fragment>
            {errors && <div className="error">{errors.fieldErrors.filter(
                (e) => !e.excludedInsuranceTypes.includes(insuranceType)).map(
                    (e) => <p key={e.message}>{e.message}</p>)}</div>}
        </React.Fragment>
    )
}

export default CalculatorFieldErrorGroup;