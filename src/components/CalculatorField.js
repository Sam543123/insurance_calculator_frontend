import React from "react";
import { useTranslation } from "react-i18next";

function CalculatorField({ labelText, children }) {
    // Wrapper for label and input field
    const { t } = useTranslation();
    return (
        <div className="field-block">
            <label>
                {t(labelText)}
            </label>
            {children}
        </div>
    )
}

export default CalculatorField;