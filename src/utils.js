import moment from 'moment';

// URL of calculator backend API
const REACT_APP_API_URL  = process.env.REACT_APP_API_URL || "http://localhost:8000/calculate/";
// Pattern that allows to enter only non-negative integer numbers to calculator input fields
const inputIntegerPattern = "[0-9]*";
// Pattern that allows to enter only non-negative float numbers to calculator input fields
const inputFloatPattern = "([0-9]+\\.?[0-9]*)?";
const dateFormat = "DD.MM.YYYY"
const requestDateFormat = "YYYY-MM-DD"

// Get errors common for all calculation types
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

// Get errors common for all calculation types except tariffs calculation
function getCommonErrors(fieldName, updatedInput, errors) {
    let newErrors = { ...errors };
    let commonErrorMessage;
    let personalFieldInputCorrect;
    let previousCommonErrorField;
    const currentDate = new Date();    
    // Errors can be either personal (for one field) or common (for several fields)
    // Common errors are added only if all input fields related to this error are filled and don't have personal errors
    // Common errors are added to last field modifed by user  
    // removeError function is used to remove previous common error if related input is correct or there is personal error
    // fieldsToValidate stores group of fields that can have common errors
    let fieldsToValidate = ["birthDate", "insuranceStartDate"];
    if (fieldsToValidate.includes(fieldName)) {
        if (fieldName === "birthDate") {
            if (updatedInput.birthDate !== "") {             
                if (!moment(updatedInput.birthDate, dateFormat, true).isValid()) {
                    newErrors[fieldName].fieldErrors.push({ message: "Enter correct birth date in dd.mm.yyyy format.", excludedInsuranceTypes: ["cumulative insurance"] });
                    newErrors[fieldName].personalFieldErrors = true;
                } else if (moment(updatedInput.birthDate, dateFormat).toDate() > currentDate) {
                    newErrors[fieldName].fieldErrors.push({ message: "Birth date can't be later than current moment.", excludedInsuranceTypes: ["cumulative insurance"] });
                    newErrors[fieldName].personalFieldErrors = true;
                }
            }
           
        } else if (fieldName === "insuranceStartDate")  {
            if (updatedInput.insuranceStartDate !== "" && !moment(updatedInput.insuranceStartDate, dateFormat, true).isValid()) {
                newErrors[fieldName].fieldErrors.push({ message: "Enter correct insurance start date in dd.mm.yyyy format.", excludedInsuranceTypes: ["cumulative insurance"] });
                newErrors[fieldName].personalFieldErrors = true;
            }
        }
        commonErrorMessage = "Birth date can't be later than insurance start date."
        previousCommonErrorField = findPreviousCommonError(fieldsToValidate, newErrors, commonErrorMessage);
        personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].personalFieldErrors === false && updatedInput[f] !== "");        
        if (personalFieldInputCorrect) {
            if (moment(updatedInput.birthDate, dateFormat).toDate() > moment(updatedInput.insuranceStartDate, dateFormat).toDate()) {
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
            const dateDifference = moment.duration(moment(updatedInput.insuranceStartDate, dateFormat).diff(moment(updatedInput.birthDate, dateFormat)));
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
    // Get field that common error is related to
    for (let f of fieldsToValidate) {
        if (errors[f].fieldErrors.some((e) => e.message === commonError)) {
            return f;
        }
    }
    return null;
}

function removeError(field, errors, targetError) {
    // Remove outdated error from list of errors related to specific field
    if (field === null) {
        return;
    }
    errors[field].fieldErrors = errors[field].fieldErrors.filter((e) => (e.message !== targetError));
}

function getCommonExcludedFields(input) {
    // Get common fields that are excluded when determining whether "Calculate" button is active
    let excludedFields = [];
    if (input.insuranceType === "cumulative insurance") {
        excludedFields.push("birthDate", "insuranceStartDate", "gender");
    } else if (input.insuranceType === "whole life insurance") {
        excludedFields.push("insurancePeriodYears", "insurancePeriodMonths");
    }

    return excludedFields;
}

const commonHandleInput = (e, input, validate, setInput, setErrors) => {
    // Update input and errors based on data entered by user into output field
    // Block entering forbidden symbols into calculator input fields
    if (!e.target.validity.valid) {
        return;
    }
    const { name, value } = e.target;
    const updatedInput = { ...input, [name]: value }
    const newErrors = validate(name, updatedInput)
    setInput(updatedInput);
    setErrors(newErrors);
}

export { findPreviousCommonError, removeError, getBaseErrors, getCommonErrors, getCommonExcludedFields, commonHandleInput, REACT_APP_API_URL, inputIntegerPattern, inputFloatPattern, dateFormat, requestDateFormat };
