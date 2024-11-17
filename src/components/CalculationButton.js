import React from "react";
import { useTranslation } from "react-i18next";

function CalculationButton({ isButtonActive }) {   
    const { t } = useTranslation();
    return (
        <button
            type="submit"
            disabled={!isButtonActive}
            className={!isButtonActive ? "calculation-button disabled" : "calculation-button"}
        >
            {t("Calculate")}
        </button>
    )
}

export default CalculationButton;