import React from "react";
import CalculatorField from "./CalculatorField.js";
import { useTranslation } from "react-i18next";


function CalculatorTraitFieldGroup({ insuranceType, insurancePremiumFrequency, gender, handleInput }) {
    // Render group of start input calculator fields
    const { t } = useTranslation();
    return (
        <React.Fragment>
            <CalculatorField labelText="Choose insurance type:">
                <select name="insuranceType" value={insuranceType} onChange={handleInput}>
                    <option value="pure endowment">{t("pure endowment")}</option>
                    <option value="term life insurance">{t("term life insurance")}</option>
                    <option value="whole life insurance">{t("whole life insurance")}</option>
                    <option value="cumulative insurance">{t("cumulative insurance")}</option>
                </select>
            </CalculatorField>
            <CalculatorField labelText="Choose payment frequency:">
                <select name="insurancePremiumFrequency" value={insurancePremiumFrequency} onChange={handleInput}>
                    <option value="simultaneously">{t("simultaneously")}</option>
                    <option value="annually">{t("annually")}</option>
                    <option value="monthly">{t("monthly")}</option>
                </select>
            </CalculatorField>
            {insuranceType !== "cumulative insurance" && (
                < CalculatorField labelText="Choose gender of insured person:">
                    <select name="gender" value={gender} onChange={handleInput}>
                        <option value="male">{t("male")}</option>
                        <option value="female">{t("female")}</option>
                    </select>
                </CalculatorField>
            )}
        </React.Fragment >
    )
}

export default CalculatorTraitFieldGroup;