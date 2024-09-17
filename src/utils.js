import moment from 'moment';

function getBaseErrors(fieldName, updatedInput, errors) {
    let newErrors = { ...errors };
    if (fieldName === "insuranceLoading") {
        if (updatedInput.insuranceLoading !== "" && Number(updatedInput.insuranceLoading) >= 1) {
            newErrors[fieldName].messages.push("Insurance loading must be less than 1.");
            newErrors[fieldName].personalFieldErrors = true;
        }
    }
    return newErrors;
}

function getCommonErrors(fieldName, updatedInput, errors) {
    let newErrors = { ...errors };
    let commonError;
    let personalFieldInputCorrect;
    const currentDate = new Date();
    let fieldsToValidate = ["birthDate", "insuranceStartDate"];
    if (fieldsToValidate.includes(fieldName)) {
        if (fieldName === "birthDate") {
            if (updatedInput.birthDate !== "" && Date.parse(updatedInput.birthDate) > currentDate) {
                newErrors[fieldName].messages.push("Birth date can't be later than current moment.");
                newErrors[fieldName].personalFieldErrors = true;
            }
        }
        commonError = "Birth date can't be later than insurance start date."
        clearPreviousCommonError(fieldsToValidate, newErrors, commonError);
        personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
        if (personalFieldInputCorrect) {
            if (Date.parse(updatedInput.birthDate) > Date.parse(updatedInput.insuranceStartDate)) {
                newErrors[fieldName].messages.push(commonError);
            }
        }

    }
    fieldsToValidate = ["insurancePeriodYears", "insurancePeriodMonths"];
    if (fieldsToValidate.includes(fieldName)) {
        if (fieldName === "insurancePeriodMonths") {
            if (updatedInput.insurancePeriodMonths !== "" && Number(updatedInput.insurancePeriodMonths) > 11) {
                newErrors[fieldName].messages.push("Number of months in insurance period must be less than 12.");
                newErrors[fieldName].personalFieldErrors = true;
            }
        }
        commonError = "Insurance period must be greater than 0.";
        clearPreviousCommonError(fieldsToValidate, newErrors, commonError);
        personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
        if (personalFieldInputCorrect) {
            if (Number(updatedInput.insurancePeriodYears) === 0 && Number(updatedInput.insurancePeriodMonths) === 0) {
                newErrors[fieldName].messages.push(commonError);
            }
        }
    }
    fieldsToValidate = ["birthDate", "insuranceStartDate", "insurancePeriodYears", "insurancePeriodMonths"];
    if (fieldsToValidate.includes(fieldName)) {
        commonError = "Age of insured person at the end of insurance period can't be greater than 101.";
        clearPreviousCommonError(fieldsToValidate, newErrors, commonError);
        if (updatedInput.insuranceType !== "cumulative insurance") {
            personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].personalFieldErrors === false && updatedInput[f] !== "");
            if (personalFieldInputCorrect) {
                const dateDifference = moment.duration(moment(Date.parse(updatedInput.insuranceStartDate)).diff(moment(Date.parse(updatedInput.birthDate))));
                const endAge = 12 * (dateDifference.years() + Number(updatedInput.insurancePeriodYears)) + dateDifference.months() + Number(updatedInput.insurancePeriodMonths)
                if (endAge > 1212 || (endAge === 1212 && dateDifference.days() !== 0)) {
                    newErrors[fieldName].messages.push(commonError);
                }
            }
        }
    }
    return newErrors;
}

function clearPreviousCommonError(fieldsToValidate, errors, commonError) {
    for (let f of fieldsToValidate) {
        if (errors[f].messages.includes(commonError)) {
            errors[f].messages = errors[f].messages.filter((m) => (m !== commonError));
            break;
        }
    }
}

// function commonHandleInput(e, validate, setInput) {
//     if (!e.target.validity.valid) {
//         return;
//     }
//     const { name, value } = e.target;
//     let updatedInput = { ...input, [name]: value }
//     validate(name, updatedInput)
//     setInput(updatedInput);
// }

// function getButtonState(input, errors) {
//     const allFields = Object.keys(input);
//     let excludedFields = [];
//     if (input.insuranceType !== "cumulative insurance") {
//         if (input.insuranceType === "whole life insurance") {
//             excludedFields.push("insurancePeriodYears", "insurancePeriodMonths");
//         }
//     } else {
//         excludedFields.push("birthDate", "insuranceStartDate");
//     }

//     const trackedFields = allFields.filter((v) => !excludedFields.includes(v));   
//     if (trackedFields.every((v) => input[v] !== "") && trackedFields.every((v) => errors[v].messages.length === 0)) {       
//         return true;
//     }
//     return false;
// }

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

export { clearPreviousCommonError, getBaseErrors, getCommonErrors, getCommonExcludedFields, commonHandleInput };