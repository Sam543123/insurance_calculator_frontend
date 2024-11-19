import React from "react";
import { useTranslation } from "react-i18next";

function Select({ options, selected, onChange, name = null, className = null }) {
    const { t } = useTranslation();
    return (
        <select name={name} className={className} selected={selected} onChange={onChange}>
            {options.map((option) => (
                <option key={option} value={option}>
                    {t(option)}
                </option>
            ))}
        </select>
    )
}

export default Select;