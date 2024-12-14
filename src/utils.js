import axios from 'axios';
import moment from 'moment';

// URL of calculator backend API
const REACT_APP_API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/calculate/";
// Pattern that allows to enter only non-negative integer numbers to calculator input fields
const inputIntegerPattern = "[0-9]*";
// Pattern that allows to enter only non-negative float numbers to calculator input fields
const inputFloatPattern = "([0-9]+\\.?[0-9]*)?";
// date format in user input
const dateFormat = "DD.MM.YYYY"
// date format in request data sent to backend
const requestDateFormat = "YYYY-MM-DD"

// Get errors common for all calculation types
function getBaseErrors(fieldName, updatedInput, currentErrors) {
    let updatedErrors = { ...currentErrors, [fieldName]: { fieldErrors: [], personalFieldErrors: false } };
    if (fieldName === "insuranceLoading") {
        if (updatedInput.insuranceLoading !== "" && Number(updatedInput.insuranceLoading) >= 100) {
            updatedErrors[fieldName].fieldErrors.push({ message: "Insurance loading must be less than 100%.", excludedInsuranceTypes: [] });
            updatedErrors[fieldName].personalFieldErrors = true;
        }
    }
    return updatedErrors;
}

// Get errors common for all calculation types except tariffs calculation
function getCommonErrors(fieldName, updatedInput, currentErrors) {
    let updatedErrors = getBaseErrors(fieldName, updatedInput, currentErrors);
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
                    updatedErrors[fieldName].fieldErrors.push({ message: "Enter correct birth date in dd.mm.yyyy format.", excludedInsuranceTypes: ["cumulative insurance"] });
                    updatedErrors[fieldName].personalFieldErrors = true;
                } else if (moment(updatedInput.birthDate, dateFormat).toDate() > currentDate) {
                    updatedErrors[fieldName].fieldErrors.push({ message: "Birth date can't be later than current moment.", excludedInsuranceTypes: ["cumulative insurance"] });
                    updatedErrors[fieldName].personalFieldErrors = true;
                }
            }

        } else if (fieldName === "insuranceStartDate") {
            if (updatedInput.insuranceStartDate !== "" && !moment(updatedInput.insuranceStartDate, dateFormat, true).isValid()) {
                updatedErrors[fieldName].fieldErrors.push({ message: "Enter correct insurance start date in dd.mm.yyyy format.", excludedInsuranceTypes: ["cumulative insurance"] });
                updatedErrors[fieldName].personalFieldErrors = true;
            }
        }
        commonErrorMessage = "Birth date can't be later than insurance start date."
        previousCommonErrorField = findPreviousCommonError(fieldsToValidate, updatedErrors, commonErrorMessage);
        personalFieldInputCorrect = fieldsToValidate.every((f) => updatedErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
        if (personalFieldInputCorrect) {
            if (moment(updatedInput.birthDate, dateFormat).toDate() > moment(updatedInput.insuranceStartDate, dateFormat).toDate()) {
                if (previousCommonErrorField === null) {
                    updatedErrors[fieldName].fieldErrors.push({ message: commonErrorMessage, excludedInsuranceTypes: ["cumulative insurance"] });
                }
            } else {
                removeError(previousCommonErrorField, updatedErrors, commonErrorMessage);
            }
        } else {
            removeError(previousCommonErrorField, updatedErrors, commonErrorMessage);
        }

    }
    fieldsToValidate = ["insurancePeriodYears", "insurancePeriodMonths"];
    if (fieldsToValidate.includes(fieldName)) {
        if (fieldName === "insurancePeriodMonths") {
            if (updatedInput.insurancePeriodMonths !== "" && Number(updatedInput.insurancePeriodMonths) > 11) {
                updatedErrors[fieldName].fieldErrors.push({ message: "Number of months in insurance period must be less than 12.", excludedInsuranceTypes: ["whole life insurance"] });
                updatedErrors[fieldName].personalFieldErrors = true;
            }
        }
        commonErrorMessage = "Insurance period must be greater than 0.";
        previousCommonErrorField = findPreviousCommonError(fieldsToValidate, updatedErrors, commonErrorMessage);
        personalFieldInputCorrect = fieldsToValidate.every((f) => updatedErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
        if (personalFieldInputCorrect) {
            if (Number(updatedInput.insurancePeriodYears) === 0 && Number(updatedInput.insurancePeriodMonths) === 0) {
                if (previousCommonErrorField === null) {
                    updatedErrors[fieldName].fieldErrors.push({ message: commonErrorMessage, excludedInsuranceTypes: ["whole life insurance"] });
                }
            } else {
                removeError(previousCommonErrorField, updatedErrors, commonErrorMessage);
            }
        } else {
            removeError(previousCommonErrorField, updatedErrors, commonErrorMessage);
        }
    }
    fieldsToValidate = ["birthDate", "insuranceStartDate", "insurancePeriodYears", "insurancePeriodMonths"];
    if (fieldsToValidate.includes(fieldName)) {
        commonErrorMessage = "Age of insured person at end of insurance period can't be greater than 101.";
        previousCommonErrorField = findPreviousCommonError(fieldsToValidate, updatedErrors, commonErrorMessage);
        personalFieldInputCorrect = fieldsToValidate.every((f) => updatedErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
        if (personalFieldInputCorrect) {
            const dateDifference = moment.duration(moment(updatedInput.insuranceStartDate, dateFormat).diff(moment(updatedInput.birthDate, dateFormat)));
            const endAge = 12 * (dateDifference.years() + Number(updatedInput.insurancePeriodYears)) + dateDifference.months() + Number(updatedInput.insurancePeriodMonths)
            if (endAge > 1212 || (endAge === 1212 && dateDifference.days() !== 0)) {
                if (previousCommonErrorField === null) {
                    updatedErrors[fieldName].fieldErrors.push({ message: commonErrorMessage, excludedInsuranceTypes: ["cumulative insurance", "whole life insurance"] });
                }
            } else {
                removeError(previousCommonErrorField, updatedErrors, commonErrorMessage);
            }
        } else {
            removeError(previousCommonErrorField, updatedErrors, commonErrorMessage);
        }
    }
    return updatedErrors;
}

// Get request data for sending to backend common for all calculation types
function getBaseRequestData(inputData) {
    let requestData = {
        insuranceType: inputData.insuranceType,
        insurancePremiumFrequency: inputData.insurancePremiumFrequency,
        technicalInterestRate: inputData.technicalInterestRate / 100,
    };
    return requestData;
}

// Get request data for sending to backend common for all calculation types except tariffs calculation
function getCommonRequestData(inputData) {
    let requestData = getBaseRequestData(inputData);

    if (inputData.insuranceType !== "cumulative insurance") {
        requestData.birthDate = moment(inputData.birthDate, dateFormat).format(requestDateFormat);
        requestData.insuranceStartDate = moment(inputData.insuranceStartDate, dateFormat).format(requestDateFormat);
        requestData.gender = inputData.gender;
    }

    if (inputData.insuranceType !== "whole life insurance") {
        requestData.insurancePeriod = 12 * Number(inputData.insurancePeriodYears) + Number(inputData.insurancePeriodMonths);
    }
    return requestData;
}

// calculate target value
async function calculate(requestData, setResult, routeURL) {
    try {
        const response = await axios.post(routeURL, requestData);
        setResult(response.data.result)
    } catch (error) {
        console.error(`Error while sending request to ${routeURL}`, error);
    }
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

const commonHandleInput = (event, input, errors, setInput, setErrors, validate) => {
    // Update input and errors based on data entered by user into output field
    // Block entering forbidden symbols into calculator input fields
    if (!event.target.validity.valid) {
        return;
    }
    const { name, value } = event.target;
    const updatedInput = { ...input, [name]: value }
    const updatedErrors = validate(name, updatedInput, errors)
    setInput(updatedInput);
    setErrors(updatedErrors);
}

export {
    commonHandleInput, getBaseErrors, getCommonErrors, findPreviousCommonError, removeError,
    getCommonExcludedFields, getBaseRequestData, getCommonRequestData, calculate, 
    REACT_APP_API_URL, inputIntegerPattern, inputFloatPattern, dateFormat, requestDateFormat
};
