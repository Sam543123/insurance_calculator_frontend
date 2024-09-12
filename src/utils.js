function getBaseValidationErrors(fieldName, updatedInput, errors) {  
    let newErrors = {...errors};     
    if (fieldName === "insuranceLoading") {
        if (updatedInput.insuranceLoading !== "" && updatedInput.insuranceLoading >= 1) {
            newErrors[fieldName] = { message: "Insurance loading must be less than 1.", isPersonalFieldError: true };
        }
    }
    return newErrors;
}

function getIntermediateValidationErrors(fieldName, updatedInput, errors) {  
    let newErrors = {...errors};  
    let fieldsToValidate = ["birthDate", "insuranceStartDate", "insurancePeriodYears", "insurancePeriodMonths"];
    let commonError;
    const currentDate = new Date();   
    if (fieldsToValidate.includes(fieldName)) {

        if (fieldName === "birthDate" || fieldName === "insuranceStartDate") {
            if (fieldName === "birthDate") {
                if (updatedInput.birthDate !== "" && Date.parse(updatedInput.birthDate) > currentDate) {
                    newErrors[fieldName] = { message: "Birth date can't be later than current moment.", isPersonalFieldError: true };
                }
            }
            fieldsToValidate = ["insuranceStartDate", "birthDate"];
            commonError = "Birth date can't be later than insurance start date."
            clearPreviousCommonError(fieldsToValidate, newErrors, commonError);
            personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].isPersonalFieldError === false && updatedInput[f] !== "");
            if (personalFieldInputCorrect) {
                if (Date.parse(updatedInput.birthDate) > Date.parse(updatedInput.insuranceStartDate)) {
                    newErrors[fieldName] = { message: commonError, isPersonalFieldError: false };
                }
            }

        } else if (fieldName === "insurancePeriodYears" || fieldName === "insurancePeriodMonths") {
            if (fieldName === "insurancePeriodMonths") {
                if (updatedInput.insurancePeriodMonths !== "" && updatedInput.insurancePeriodMonths > 11) {
                    newErrors[fieldName] = { message: "Number of months in insurance period must be less than 12.", isPersonalFieldError: true };
                }
            }

            fieldsToValidate = ["insurancePeriodYears", "insurancePeriodMonths"];
            commonError = "Insurance period must be greater than 0.";
            clearPreviousCommonError(fieldsToValidate, newErrors, commonError);
            personalFieldInputCorrect = fieldsToValidate.every((f) => newErrors[f].isPersonalFieldError === false && updatedInput[f] !== "");
            if (personalFieldInputCorrect) {
                if (Number(updatedInput.insurancePeriodYears) === 0 && Number(updatedInput.insurancePeriodMonths) === 0) {
                    newErrors[fieldName] = { message: commonError, isPersonalFieldError: false };
                }
            }
        }
    }
    return newErrors;
}

function clearPreviousCommonError(fieldsToValidate, errors, commonError) {
    for (let f of fieldsToValidate) {
        if (errors[f].message === commonError) {
            errors[f] = null;
            break;
        }
    }
}

function commonHandleInput(e, validate, setInput) {
    if (!e.target.validity.valid) {
        return;
    }
    const { name, value } = e.target;
    let updatedInput = { ...input, [name]: value }
    validate(name, updatedInput)
    setInput(updatedInput);
}

function getButtonState(input, errors) {
    const allFields = Object.keys(input);
    let excludedFields = [];
    if (input.insuranceType !== "cumulative insurance") {                   
        if (input.insuranceType === "whole life insurance") {
            excludedFields.push("insurancePeriodYears", "insurancePeriodMonths");
        }
    } else {
        excludedFields.push("birthDate", "insuranceStartDate");            
    }

    const trackedFields = allFields.filter((v) => !excludedFields.includes(v));
    if (trackedFields.every((v) => input[v] !== "") && trackedFields.every((v) => !errors[v])) {
        return true;           
    }
    return false;
}

export { clearPreviousCommonError, getBaseValidationErrors, getIntermediateValidationErrors, commonHandleInput, getButtonState };