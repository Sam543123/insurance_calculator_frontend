function clearPreviousCommonError(fieldsToValidate, errors, commonError) {
    for (let f of fieldsToValidate) {
        if (errors[f].message === commonError)
            {
                errors[f] = null;
                break;               
            }      
    }
}

export {clearPreviousCommonError};