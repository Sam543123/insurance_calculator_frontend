import React from "react";
import { useTranslation } from "react-i18next";

function CalculatorFieldErrorGroup({ errors, insuranceType }) {
    const { t } = useTranslation();
    // Render all errors for calculator input field related to specific insurance type
    return (
        <React.Fragment>
            {errors && <div className="error">{errors.fieldErrors.filter(
                (e) => !e.excludedInsuranceTypes.includes(insuranceType)).map(
                    (e) => <p key={e.message}>{t(e.message)}</p>)}</div>}
        </React.Fragment>
    )
}

export default CalculatorFieldErrorGroup;