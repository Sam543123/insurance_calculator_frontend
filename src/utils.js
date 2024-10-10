import moment from 'moment';

const REACT_APP_API_URL  = process.env.REACT_APP_API_URL || "http://localhost:8000/calculate/";
const inputIntegerPattern = "[0-9]*";
const inputFloatPattern = "([0-9]+\\.?[0-9]*)?";

function getBaseErrors(fieldName, updatedInput, errors) {
    let newErrors = { ...errors };
    if (fieldName === "insuranceLoading") {
        if (updatedInput.insuranceLoading !== "" && Number(updatedInput.insuranceLoading) >= 100) {
            newErrors[fieldName].fieldErrors.push({ message: "Insurance loading must be less than 100%.", excludedInsuranceTypes: [] });
            newErrors[fieldName].personalFieldErrors = true;
        }
    }
    return newErrors;
}

function getCommonErrors(fieldName, updatedInput, errors) {
    let newErrors = { ...errors };
    let commonErrorMessage;
    let personalFieldInputCorrect;
    let previousCommonErrorField;
    const currentDate = new Date();
    let fieldsToValidate = ["birthDate", "insuranceStartDate"];
    if (fieldsToValidate.includes(fieldName)) {
        if (fieldName === "birthDate") {
            if (updatedInput.birthDate !== "" && Date.parse(updatedInput.birthDate) > currentDate) {
                newErrors[fieldName].fieldErrors.push({ message: "Birth date can't be later than current moment.", excludedInsuranceTypes: ["cumulative insurance"] });
                newErrors[fieldName].personalFieldErrors = true;
            }
        }
        commonErrorMessage = "Birth date can't be later than insurance start date."
        previousCommonErrorField = findPreviousCommonError(fieldsToValidate, newErrors, commonErrorMessage);
        personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
        if (personalFieldInputCorrect) {
            if (Date.parse(updatedInput.birthDate) > Date.parse(updatedInput.insuranceStartDate)) {
                if (previousCommonErrorField === null) {
                    newErrors[fieldName].fieldErrors.push({ message: commonErrorMessage, excludedInsuranceTypes: ["cumulative insurance"] });
                }
            } else {
                removeError(previousCommonErrorField, newErrors, commonErrorMessage);
            }
        } else {
            removeError(previousCommonErrorField, newErrors, commonErrorMessage);
        }

    }
    fieldsToValidate = ["insurancePeriodYears", "insurancePeriodMonths"];
    if (fieldsToValidate.includes(fieldName)) {
        if (fieldName === "insurancePeriodMonths") {
            if (updatedInput.insurancePeriodMonths !== "" && Number(updatedInput.insurancePeriodMonths) > 11) {
                newErrors[fieldName].fieldErrors.push({ message: "Number of months in insurance period must be less than 12.", excludedInsuranceTypes: ["whole life insurance"] });
                newErrors[fieldName].personalFieldErrors = true;
            }
        }
        commonErrorMessage = "Insurance period must be greater than 0.";
        previousCommonErrorField = findPreviousCommonError(fieldsToValidate, newErrors, commonErrorMessage);
        personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
        if (personalFieldInputCorrect) {
            if (Number(updatedInput.insurancePeriodYears) === 0 && Number(updatedInput.insurancePeriodMonths) === 0) {
                if (previousCommonErrorField === null) {
                    newErrors[fieldName].fieldErrors.push({ message: commonErrorMessage, excludedInsuranceTypes: ["whole life insurance"] });
                }
            } else {
                removeError(previousCommonErrorField, newErrors, commonErrorMessage);
            }
        } else {
            removeError(previousCommonErrorField, newErrors, commonErrorMessage);
        }
    }
    fieldsToValidate = ["birthDate", "insuranceStartDate", "insurancePeriodYears", "insurancePeriodMonths"];
    if (fieldsToValidate.includes(fieldName)) {
        commonErrorMessage = "Age of insured person at end of insurance period can't be greater than 101.";
        previousCommonErrorField = findPreviousCommonError(fieldsToValidate, newErrors, commonErrorMessage);
        personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
        if (personalFieldInputCorrect) {
            const dateDifference = moment.duration(moment(Date.parse(updatedInput.insuranceStartDate)).diff(moment(Date.parse(updatedInput.birthDate))));
            const endAge = 12 * (dateDifference.years() + Number(updatedInput.insurancePeriodYears)) + dateDifference.months() + Number(updatedInput.insurancePeriodMonths)
            if (endAge > 1212 || (endAge === 1212 && dateDifference.days() !== 0)) {
                if (previousCommonErrorField === null) {
                    newErrors[fieldName].fieldErrors.push({ message: commonErrorMessage, excludedInsuranceTypes: ["cumulative insurance", "whole life insurance"] });
                }
            } else {
                removeError(previousCommonErrorField, newErrors, commonErrorMessage);
            }
        } else {
            removeError(previousCommonErrorField, newErrors, commonErrorMessage);
        }
    }
    return newErrors;
}

function findPreviousCommonError(fieldsToValidate, errors, commonError) {
    for (let f of fieldsToValidate) {
        if (errors[f].fieldErrors.some((e) => e.message === commonError)) {
            return f;
        }
    }
    return null;
}

function removeError(field, errors, commonError) {
    if (field === null) {
        return;
    }
    errors[field].fieldErrors = errors[field].fieldErrors.filter((e) => (e.message !== commonError));
}

function getCommonExcludedFields(input) {
    let excludedFields = [];
    if (input.insuranceType === "cumulative insurance") {
        excludedFields.push("birthDate", "insuranceStartDate");
    } else if (input.insuranceType === "whole life insurance") {
        excludedFields.push("insurancePeriodYears", "insurancePeriodMonths");
    }

    return excludedFields;
}

const commonHandleInput = (e, input, validate, setInput, setErrors) => {
    if (!e.target.validity.valid) {
        return;
    }
    const { name, value } = e.target;
    const updatedInput = { ...input, [name]: value }
    const newErrors = validate(name, updatedInput)
    setInput(updatedInput);
    setErrors(newErrors);
}

export { findPreviousCommonError, removeError, getBaseErrors, getCommonErrors, getCommonExcludedFields, commonHandleInput, REACT_APP_API_URL, inputIntegerPattern, inputFloatPattern };
