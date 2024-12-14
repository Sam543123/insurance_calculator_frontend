import React from "react";
import { useTranslation } from "react-i18next";
import { GB, RU } from "country-flag-icons/react/3x2";

function LanguageSwitchButton() {
    const { i18n } = useTranslation();
    const toggleLanguage = () => {
        const language = i18n.language === "en" ? "ru" : "en";
        i18n.changeLanguage(language);
    };
    return (
        <button
            onClick={toggleLanguage}
            className="language-switch-button"
        >
            {i18n.language === "en" ? (
                <React.Fragment>
                    <div><h2>EN</h2></div>
                    <div><GB className="language-icon" /></div>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <div><h2>RU</h2></div>
                    <div><RU className="language-icon" /></div>
                </React.Fragment>
            )}
        </button>
    )
}

export default LanguageSwitchButton;