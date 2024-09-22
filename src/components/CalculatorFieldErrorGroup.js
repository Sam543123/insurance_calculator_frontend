import React from "react";

function CalculatorFieldErrorGroup({ errors, insuranceType }) {
    return (
        <React.Fragment>
            {errors && <div className="error">{errors.fieldErrors.filter(
                (e) => !e.excludedInsuranceTypes.includes(insuranceType)).map(
                    (e) => <p key={e.message}>{e.message}</p>)}</div>}
        </React.Fragment>
    )
}

export default CalculatorFieldErrorGroup;